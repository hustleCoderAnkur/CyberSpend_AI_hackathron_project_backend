import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    securityControls,
    organizations,
} from "../../db/schema.js";

import type {
    CreateControlInput,
    UpdateControlInput,
} from "./controls.schema.js";

export class ControlError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "ControlError";
    }
}

// Verify organization access
async function verifyOrganizationAccess(
    organizationId: string,
    userId: string
): Promise<void> {
    const [organization] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(
            and(
                eq(organizations.id, organizationId),
                eq(organizations.createdBy, userId)
            )
        )
        .limit(1);

    if (!organization) {
        throw new ControlError(
            "Organization not found or access denied",
            404
        );
    }
}

// Create security control
export async function createControl(
    input: CreateControlInput,
    userId: string
) {
    await verifyOrganizationAccess(input.organizationId, userId);

    const [control] = await db
        .insert(securityControls)
        .values({
            organizationId: input.organizationId,
            name: input.name,
            category: input.category,
            cost: input.cost.toFixed(2),
            effectiveness: input.effectiveness.toFixed(4),
            status: input.status,
        })
        .returning();

    if (!control) {
        throw new ControlError(
            "Failed to create security control",
            500
        );
    }

    return control;
}

// Get controls by organization
export async function getControlsByOrganization(
    organizationId: string,
    userId: string
) {
    await verifyOrganizationAccess(organizationId, userId);

    return db
        .select()
        .from(securityControls)
        .where(
            eq(securityControls.organizationId, organizationId)
        );
}

// Get control by ID
export async function getControlById(
    controlId: string,
    userId: string
) {
    const [control] = await db
        .select()
        .from(securityControls)
        .where(eq(securityControls.id, controlId))
        .limit(1);

    if (!control) {
        throw new ControlError("Security control not found", 404);
    }

    await verifyOrganizationAccess(control.organizationId, userId);

    return control;
}

// Update security control
export async function updateControl(
    controlId: string,
    input: UpdateControlInput,
    userId: string
) {
    const existingControl = await getControlById(
        controlId,
        userId
    );

    const updateValues = {
        ...(input.name !== undefined && {
            name: input.name,
        }),
        ...(input.category !== undefined && {
            category: input.category,
        }),
        ...(input.cost !== undefined && {
            cost: input.cost.toFixed(2),
        }),
        ...(input.effectiveness !== undefined && {
            effectiveness: input.effectiveness.toFixed(4),
        }),
        ...(input.status !== undefined && {
            status: input.status,
        }),
    };

    const [updatedControl] = await db
        .update(securityControls)
        .set(updateValues)
        .where(eq(securityControls.id, existingControl.id))
        .returning();

    if (!updatedControl) {
        throw new ControlError(
            "Failed to update security control",
            500
        );
    }

    return updatedControl;
}