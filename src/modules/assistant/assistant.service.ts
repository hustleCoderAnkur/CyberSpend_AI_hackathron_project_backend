import { and, eq, desc } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessments,
    assessmentRuns,
    workspaces,
    organizations,
} from "../../db/schema.js";
import { env } from "../../config/env.js";

import type { AssistantChatInput } from "./assistant.schema.js";

export class AssistantError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "AssistantError";
    }
}

type WebSearchResult = {
    title?: string;
    snippet?: string;
    url?: string;
    site_name?: string;
};

async function searchTinyFish(
    query: string
): Promise<WebSearchResult[]> {
    const url = new URL("https://api.search.tinyfish.ai");
    url.searchParams.set("query", query);
    url.searchParams.set("location", "IN");
    url.searchParams.set("language", "en");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": env.tinyfishApiKey,
        },
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
        throw new AssistantError(
            `Web research provider returned status ${response.status}`,
            502
        );
    }

    const data: unknown = await response.json();

    if (
        typeof data !== "object" ||
        data === null ||
        !("results" in data) ||
        !Array.isArray(data.results)
    ) {
        throw new AssistantError(
            "Invalid response from web research provider",
            502
        );
    }

    return data.results.slice(0, 5) as WebSearchResult[];
}

// Verify assessment belongs to an organization the user created
async function getAssessmentContext(
    assessmentId: string,
    userId: string
) {
    const [assessment] = await db
        .select({
            id: assessments.id,
            name: assessments.name,
            status: assessments.status,
            workspaceId: assessments.workspaceId,
        })
        .from(assessments)
        .innerJoin(
            workspaces,
            eq(assessments.workspaceId, workspaces.id)
        )
        .innerJoin(
            organizations,
            eq(workspaces.organizationId, organizations.id)
        )
        .where(
            and(
                eq(assessments.id, assessmentId),
                eq(organizations.createdBy, userId)
            )
        )
        .limit(1);

    if (!assessment) {
        throw new AssistantError(
            "Assessment not found or access denied",
            404
        );
    }

    const runs = await db
        .select({
            id: assessmentRuns.id,
            runNumber: assessmentRuns.runNumber,
            modelVersion: assessmentRuns.modelVersion,
            riskScore: assessmentRuns.riskScore,
            expectedAnnualLoss: assessmentRuns.expectedAnnualLoss,
            result: assessmentRuns.result,
            completedAt: assessmentRuns.completedAt,
        })
        .from(assessmentRuns)
        .where(eq(assessmentRuns.assessmentId, assessmentId))
        .orderBy(desc(assessmentRuns.runNumber))
        .limit(3);

    return {
        assessment,
        recentRuns: runs,
    };
}

export async function chatWithAssistant(
    input: AssistantChatInput,
    userId: string
) {
    let assessmentContext: Awaited<
        ReturnType<typeof getAssessmentContext>
    > | null = null;

    if (input.assessmentId) {
        assessmentContext = await getAssessmentContext(
            input.assessmentId,
            userId
        );
    }

    let webResearch: WebSearchResult[] = [];

    if (input.useWeb) {
        webResearch = await searchTinyFish(input.message);
    }

    if (!env.fastApiUrl) {
        throw new Error(
            "FASTAPI_URL is not configured. Assessment service is unavailable.",
        );
    }

    // This endpoint must match your FastAPI implementation.
    const response = await fetch(
        `${env.fastApiUrl.replace(/\/+$/, "")}/assistant/chat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: input.message,
                conversationId: input.conversationId,
                assessmentContext,
                webResearch,
            }),
            signal: AbortSignal.timeout(60000),
        }
    );

    if (!response.ok) {
        throw new AssistantError(
            `AI analysis service returned status ${response.status}`,
            502
        );
    }

    const result: unknown = await response.json();

    if (
        typeof result !== "object" ||
        result === null ||
        !("answer" in result) ||
        typeof result.answer !== "string"
    ) {
        throw new AssistantError(
            "Invalid response from AI analysis service",
            502
        );
    }

    return {
        answer: result.answer,
        conversationId:
            "conversationId" in result &&
                typeof result.conversationId === "string"
                ? result.conversationId
                : input.conversationId ?? null,
        assessmentId: input.assessmentId ?? null,
        webResearchUsed: input.useWeb,
        sources: webResearch.map((item) => ({
            title: item.title ?? "Untitled source",
            url: item.url ?? null,
            snippet: item.snippet ?? null,
            site: item.site_name ?? null,
        })),
    };
}