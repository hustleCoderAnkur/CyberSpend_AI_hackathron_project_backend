import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessments,
    workspaces,
    organizations,
} from "../../db/schema.js";

import type {
    CreateAssessmentInput,
    UpdateAssessmentInput,
} from "./assessments.schema.js";

export class AssessmentError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "AssessmentError";
    }
}

// Verify workspace access
async function verifyWorkspaceAccess(
    workspaceId: string,
    userId: string
): Promise<void> {
    const [workspace] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .innerJoin(
            organizations,
            eq(workspaces.organizationId, organizations.id)
        )
        .where(
            and(
                eq(workspaces.id, workspaceId),
                eq(organizations.createdBy, userId)
            )
        )
        .limit(1);

    if (!workspace) {
        throw new AssessmentError(
            "Workspace not found or access denied",
            404
        );
    }
}

// Create assessment
export async function createAssessment(
    input: CreateAssessmentInput,
    userId: string
) {
    await verifyWorkspaceAccess(input.workspaceId, userId);

    const [assessment] = await db
        .insert(assessments)
        .values({
            workspaceId: input.workspaceId,
            name: input.name,
            status: input.status,
            createdBy: userId,
        })
        .returning();

    if (!assessment) {
        throw new AssessmentError(
            "Failed to create assessment",
            500
        );
    }

    return assessment;
}

// Get assessments by workspace
export async function getAssessmentsByWorkspace(
    workspaceId: string,
    userId: string
) {
    await verifyWorkspaceAccess(workspaceId, userId);

    return db
        .select()
        .from(assessments)
        .where(eq(assessments.workspaceId, workspaceId));
}

// Get assessment by ID
export async function getAssessmentById(
    assessmentId: string,
    userId: string
) {
    const [assessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, assessmentId))
        .limit(1);

    if (!assessment) {
        throw new AssessmentError("Assessment not found", 404);
    }

    await verifyWorkspaceAccess(assessment.workspaceId, userId);

    return assessment;
}

// Update assessment
export async function updateAssessment(
    assessmentId: string,
    input: UpdateAssessmentInput,
    userId: string
) {
    const existingAssessment = await getAssessmentById(
        assessmentId,
        userId
    );

    const updateValues = {
        ...(input.name !== undefined && {
            name: input.name,
        }),
        ...(input.status !== undefined && {
            status: input.status,
        }),
    };

    const [updatedAssessment] = await db
        .update(assessments)
        .set(updateValues)
        .where(eq(assessments.id, existingAssessment.id))
        .returning();

    if (!updatedAssessment) {
        throw new AssessmentError(
            "Failed to update assessment",
            500
        );
    }

    return updatedAssessment;
}