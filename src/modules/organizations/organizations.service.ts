import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { organizations } from "../../db/schema.js";

import type {
    CreateOrganizationInput,
    OrganizationIdInput,
    UpdateOrganizationInput,
} from "./organizations.schema.js";

export class OrganizationError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "OrganizationError";
    }
}

export async function createOrganization(
    input: CreateOrganizationInput,
    userId: string
) {
    const [organization] = await db
        .insert(organizations)
        .values({
            name: input.name,
            createdBy: userId,
        })
        .returning({
            id: organizations.id,
            name: organizations.name,
            createdBy: organizations.createdBy,
        });

    if (!organization) {
        throw new OrganizationError(
            "Failed to create organization",
            500
        );
    }

    return organization;
}

export async function getOrganizationById(
    input: OrganizationIdInput,
    userId: string
) {
    const [organization] = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            createdBy: organizations.createdBy,
        })
        .from(organizations)
        .where(eq(organizations.id, input.organizationId))
        .limit(1);

    if (!organization) {
        throw new OrganizationError(
            "Organization not found",
            404
        );
    }

    if (organization.createdBy !== userId) {
        throw new OrganizationError(
            "You do not have permission to access this organization",
            403
        );
    }

    return organization;
}

export async function updateOrganization(
    organizationId: string,
    input: UpdateOrganizationInput,
    userId: string
) {
    const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

    if (!organization) {
        throw new OrganizationError(
            "Organization not found",
            404
        );
    }

    if (organization.createdBy !== userId) {
        throw new OrganizationError(
            "You do not have permission to update this organization",
            403
        );
    }

    const [updatedOrganization] = await db
        .update(organizations)
        .set({
            name: input.name,
        })
        .where(eq(organizations.id, organizationId))
        .returning({
            id: organizations.id,
            name: organizations.name,
            createdBy: organizations.createdBy,
        });

    if (!updatedOrganization) {
        throw new OrganizationError(
            "Failed to update organization",
            500
        );
    }

    return updatedOrganization;
}