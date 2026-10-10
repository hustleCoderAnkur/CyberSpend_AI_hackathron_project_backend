import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessments,
    assessmentRuns,
    organizations,
    recommendations,
    workspaces,
} from "../../db/schema.js";

import type {
    CreateRecommendationInput,
    UpdateRecommendationStatusInput,
} from "./recommendations.schema.js";

export class RecommendationError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "RecommendationError";
    }
}

async function verifyAssessmentRunAccess(
    assessmentRunId: string,
    userId: string,
) {
    const [run] = await db
        .select({
            id: assessmentRuns.id,
        })
        .from(assessmentRuns)
        .innerJoin(
            assessments,
            eq(assessmentRuns.assessmentId, assessments.id),
        )
        .innerJoin(workspaces, eq(assessments.workspaceId, workspaces.id))
        .innerJoin(
            organizations,
            eq(workspaces.organizationId, organizations.id),
        )
        .where(
            and(
                eq(assessmentRuns.id, assessmentRunId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!run) {
        throw new RecommendationError(
            "Assessment run not found or access denied",
            404,
        );
    }

    return run;
}

async function verifyRecommendationAccess(
    recommendationId: string,
    userId: string,
) {
    const [recommendation] = await db
        .select({
            id: recommendations.id,
        })
        .from(recommendations)
        .innerJoin(
            assessmentRuns,
            eq(recommendations.assessmentRunId, assessmentRuns.id),
        )
        .innerJoin(
            assessments,
            eq(assessmentRuns.assessmentId, assessments.id),
        )
        .innerJoin(workspaces, eq(assessments.workspaceId, workspaces.id))
        .innerJoin(
            organizations,
            eq(workspaces.organizationId, organizations.id),
        )
        .where(
            and(
                eq(recommendations.id, recommendationId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!recommendation) {
        throw new RecommendationError(
            "Recommendation not found or access denied",
            404,
        );
    }

    return recommendation;
}

export async function createRecommendation(
    input: CreateRecommendationInput,
    userId: string,
) {
    await verifyAssessmentRunAccess(input.assessmentRunId, userId);

    const [created] = await db
        .insert(recommendations)
        .values({
            assessmentRunId: input.assessmentRunId,
            securityControlId: input.securityControlId ?? null,
            title: input.title,
            estimatedCost: input.estimatedCost?.toFixed(2) ?? null,
            expectedRiskReduction:
                input.expectedRiskReduction?.toFixed(4) ?? null,
            roi: input.roi?.toFixed(4) ?? null,
            status: "pending",
        })
        .returning();

    return created;
}

export async function getRecommendationsByAssessmentRun(
    assessmentRunId: string,
    userId: string,
) {
    await verifyAssessmentRunAccess(assessmentRunId, userId);

    return db
        .select()
        .from(recommendations)
        .where(eq(recommendations.assessmentRunId, assessmentRunId))
        .orderBy(desc(recommendations.id));
}

export async function getRecommendationById(
    recommendationId: string,
    userId: string,
) {
    await verifyRecommendationAccess(recommendationId, userId);

    const [recommendation] = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.id, recommendationId))
        .limit(1);

    if (!recommendation) {
        throw new RecommendationError("Recommendation not found", 404);
    }

    return recommendation;
}

export async function updateRecommendationStatus(
    recommendationId: string,
    input: UpdateRecommendationStatusInput,
    userId: string,
) {
    await verifyRecommendationAccess(recommendationId, userId);

    const [updated] = await db
        .update(recommendations)
        .set({
            status: input.status,
        })
        .where(eq(recommendations.id, recommendationId))
        .returning();

    if (!updated) {
        throw new RecommendationError("Recommendation not found", 404);
    }

    return updated;
}