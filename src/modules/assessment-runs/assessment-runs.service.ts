import { and, eq, desc } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessmentRuns,
    assessments,
    workspaces,
    organizations,
} from "../../db/schema.js";

import type {
    CreateAssessmentRunInput,
    UpdateAssessmentRunResultInput,
} from "./assessment-runs.schema.js";

export class AssessmentRunError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "AssessmentRunError";
    }
}

// Verify assessment access
async function verifyAssessmentAccess(
    assessmentId: string,
    userId: string
): Promise<void> {
    const [assessment] = await db
        .select({ id: assessments.id })
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
        throw new AssessmentRunError(
            "Assessment not found or access denied",
            404
        );
    }
}

// Create assessment run
export async function createAssessmentRun(
    input: CreateAssessmentRunInput,
    userId: string
) {
    await verifyAssessmentAccess(input.assessmentId, userId);

    try {
        const [run] = await db
            .insert(assessmentRuns)
            .values({
                assessmentId: input.assessmentId,
                runNumber: input.runNumber,
                modelVersion: input.modelVersion,
                inputSnapshot: input.inputSnapshot,
            })
            .returning();

        if (!run) {
            throw new AssessmentRunError(
                "Failed to create assessment run",
                500
            );
        }

        return run;
    } catch (error) {
        if (error instanceof AssessmentRunError) {
            throw error;
        }

        // PostgreSQL unique constraint violation
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            throw new AssessmentRunError(
                "This run number already exists for the assessment",
                409
            );
        }

        throw error;
    }
}

// List runs for an assessment
export async function getAssessmentRuns(
    assessmentId: string,
    userId: string
) {
    await verifyAssessmentAccess(assessmentId, userId);

    return db
        .select()
        .from(assessmentRuns)
        .where(eq(assessmentRuns.assessmentId, assessmentId))
        .orderBy(desc(assessmentRuns.runNumber));
}

// Get a single run
export async function getAssessmentRunById(
    runId: string,
    userId: string
) {
    const [run] = await db
        .select()
        .from(assessmentRuns)
        .where(eq(assessmentRuns.id, runId))
        .limit(1);

    if (!run) {
        throw new AssessmentRunError(
            "Assessment run not found",
            404
        );
    }

    await verifyAssessmentAccess(run.assessmentId, userId);

    return run;
}

// Save calculated assessment results
export async function updateAssessmentRunResult(
    runId: string,
    input: UpdateAssessmentRunResultInput,
    userId: string
) {
    const existingRun = await getAssessmentRunById(runId, userId);

    const updateValues = {
        ...(input.riskScore !== undefined && {
            riskScore: input.riskScore?.toFixed(4) ?? null,
        }),
        ...(input.expectedAnnualLoss !== undefined && {
            expectedAnnualLoss:
                input.expectedAnnualLoss?.toFixed(2) ?? null,
        }),
        ...(input.result !== undefined && {
            result: input.result,
        }),
        completedAt: new Date(),
    };

    const [updatedRun] = await db
        .update(assessmentRuns)
        .set(updateValues)
        .where(eq(assessmentRuns.id, existingRun.id))
        .returning();

    if (!updatedRun) {
        throw new AssessmentRunError(
            "Failed to update assessment run results",
            500
        );
    }

    return updatedRun;
}