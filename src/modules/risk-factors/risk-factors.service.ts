
import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessments,
    assessmentRuns,
    organizations,
    riskFactors,
    workspaces,
} from "../../db/schema.js";

import type { CreateRiskFactorInput } from "./risk-factors.schema.js";

export class RiskFactorError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "RiskFactorError";
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
        .innerJoin(
            workspaces,
            eq(assessments.workspaceId, workspaces.id),
        )
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
        throw new RiskFactorError(
            "Assessment run not found or access denied",
            404,
        );
    }

    return run;
}

async function verifyRiskFactorAccess(
    riskFactorId: string,
    userId: string,
) {
    const [factor] = await db
        .select({
            id: riskFactors.id,
        })
        .from(riskFactors)
        .innerJoin(
            assessmentRuns,
            eq(riskFactors.assessmentRunId, assessmentRuns.id),
        )
        .innerJoin(
            assessments,
            eq(assessmentRuns.assessmentId, assessments.id),
        )
        .innerJoin(
            workspaces,
            eq(assessments.workspaceId, workspaces.id),
        )
        .innerJoin(
            organizations,
            eq(workspaces.organizationId, organizations.id),
        )
        .where(
            and(
                eq(riskFactors.id, riskFactorId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!factor) {
        throw new RiskFactorError(
            "Risk factor not found or access denied",
            404,
        );
    }

    return factor;
}

export async function createRiskFactor(
    input: CreateRiskFactorInput,
    userId: string,
) {
    await verifyAssessmentRunAccess(input.assessmentRunId, userId);

    const [createdFactor] = await db
        .insert(riskFactors)
        .values({
            assessmentRunId: input.assessmentRunId,
            assetId: input.assetId ?? null,
            factorName: input.factorName,
            contribution: input.contribution.toFixed(4),
            explanation: input.explanation ?? null,
        })
        .returning();

    return createdFactor;
}

export async function getRiskFactorsByAssessmentRun(
    assessmentRunId: string,
    userId: string,
) {
    await verifyAssessmentRunAccess(assessmentRunId, userId);

    return db
        .select()
        .from(riskFactors)
        .where(eq(riskFactors.assessmentRunId, assessmentRunId))
        .orderBy(desc(riskFactors.id));
}

export async function getRiskFactorById(
    riskFactorId: string,
    userId: string,
) {
    await verifyRiskFactorAccess(riskFactorId, userId);

    const [factor] = await db
        .select()
        .from(riskFactors)
        .where(eq(riskFactors.id, riskFactorId))
        .limit(1);

    if (!factor) {
        throw new RiskFactorError("Risk factor not found", 404);
    }

    return factor;
}
