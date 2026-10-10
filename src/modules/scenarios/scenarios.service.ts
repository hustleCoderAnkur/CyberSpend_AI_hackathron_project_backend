
import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessments,
    organizations,
    scenarios,
    workspaces,
} from "../../db/schema.js";

import type {
    CreateScenarioInput,
    UpdateScenarioInput,
} from "./scenarios.schema.js";

export class ScenarioError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "ScenarioError";
    }
}

async function verifyAssessmentAccess(
    assessmentId: string,
    userId: string,
) {
    const [assessment] = await db
        .select({
            id: assessments.id,
        })
        .from(assessments)
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
                eq(assessments.id, assessmentId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!assessment) {
        throw new ScenarioError(
            "Assessment not found or access denied",
            404,
        );
    }

    return assessment;
}

async function verifyScenarioAccess(
    scenarioId: string,
    userId: string,
) {
    const [scenario] = await db
        .select({
            id: scenarios.id,
            assessmentId: scenarios.assessmentId,
        })
        .from(scenarios)
        .innerJoin(
            assessments,
            eq(scenarios.assessmentId, assessments.id),
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
                eq(scenarios.id, scenarioId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!scenario) {
        throw new ScenarioError(
            "Scenario not found or access denied",
            404,
        );
    }

    return scenario;
}

export async function createScenario(
    input: CreateScenarioInput,
    userId: string,
) {
    await verifyAssessmentAccess(input.assessmentId, userId);

    const [createdScenario] = await db
        .insert(scenarios)
        .values({
            assessmentId: input.assessmentId,
            name: input.name,
            budget: input.budget?.toFixed(2) ?? null,
        })
        .returning();

    return createdScenario;
}

export async function getScenariosByAssessment(
    assessmentId: string,
    userId: string,
) {
    await verifyAssessmentAccess(assessmentId, userId);

    return db
        .select()
        .from(scenarios)
        .where(eq(scenarios.assessmentId, assessmentId))
        .orderBy(desc(scenarios.createdAt));
}

export async function getScenarioById(
    scenarioId: string,
    userId: string,
) {
    await verifyScenarioAccess(scenarioId, userId);

    const [scenario] = await db
        .select()
        .from(scenarios)
        .where(eq(scenarios.id, scenarioId))
        .limit(1);

    if (!scenario) {
        throw new ScenarioError("Scenario not found", 404);
    }

    return scenario;
}

export async function updateScenario(
    scenarioId: string,
    input: UpdateScenarioInput,
    userId: string,
) {
    await verifyScenarioAccess(scenarioId, userId);

    const updateData: {
        name?: string;
        budget?: string | null;
        results?: Record<string, unknown> | null;
    } = {};

    if (input.name !== undefined) {
        updateData.name = input.name;
    }

    if (input.budget !== undefined) {
        updateData.budget = input.budget?.toFixed(2) ?? null;
    }

    if (input.results !== undefined) {
        updateData.results = input.results;
    }

    const [updatedScenario] = await db
        .update(scenarios)
        .set(updateData)
        .where(eq(scenarios.id, scenarioId))
        .returning();

    if (!updatedScenario) {
        throw new ScenarioError("Scenario not found", 404);
    }

    return updatedScenario;
}

export async function deleteScenario(
    scenarioId: string,
    userId: string,
) {
    await verifyScenarioAccess(scenarioId, userId);

    const [deletedScenario] = await db
        .delete(scenarios)
        .where(eq(scenarios.id, scenarioId))
        .returning();

    if (!deletedScenario) {
        throw new ScenarioError("Scenario not found", 404);
    }

    return deletedScenario;
}
