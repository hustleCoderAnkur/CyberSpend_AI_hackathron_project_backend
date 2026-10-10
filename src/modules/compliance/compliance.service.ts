import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    complianceMappings,
    organizations,
} from "../../db/schema.js";

import type {
    CreateComplianceMappingInput,
    UpdateComplianceMappingInput,
} from "./compliance.schema.js";

export class ComplianceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "ComplianceError";
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
        throw new ComplianceError(
            "Organization not found or access denied",
            404
        );
    }
}

// Create compliance mapping
export async function createComplianceMapping(
    input: CreateComplianceMappingInput,
    userId: string
) {
    await verifyOrganizationAccess(input.organizationId, userId);

    const [mapping] = await db
        .insert(complianceMappings)
        .values({
            organizationId: input.organizationId,
            framework: input.framework,
            requirementCode: input.requirementCode,
            controlName: input.controlName,
            status: input.status,
        })
        .returning();

    if (!mapping) {
        throw new ComplianceError(
            "Failed to create compliance mapping",
            500
        );
    }

    return mapping;
}

// Get compliance mappings by organization
export async function getComplianceMappingsByOrganization(
    organizationId: string,
    userId: string
) {
    await verifyOrganizationAccess(organizationId, userId);

    return db
        .select()
        .from(complianceMappings)
        .where(
            eq(complianceMappings.organizationId, organizationId)
        );
}

// Get compliance mapping by ID
export async function getComplianceMappingById(
    mappingId: string,
    userId: string
) {
    const [mapping] = await db
        .select()
        .from(complianceMappings)
        .where(eq(complianceMappings.id, mappingId))
        .limit(1);

    if (!mapping) {
        throw new ComplianceError(
            "Compliance mapping not found",
            404
        );
    }

    await verifyOrganizationAccess(mapping.organizationId, userId);

    return mapping;
}

// Update compliance mapping
export async function updateComplianceMapping(
    mappingId: string,
    input: UpdateComplianceMappingInput,
    userId: string
) {
    const existingMapping = await getComplianceMappingById(
        mappingId,
        userId
    );

    const updateValues = {
        ...(input.framework !== undefined && {
            framework: input.framework,
        }),
        ...(input.requirementCode !== undefined && {
            requirementCode: input.requirementCode,
        }),
        ...(input.controlName !== undefined && {
            controlName: input.controlName,
        }),
        ...(input.status !== undefined && {
            status: input.status,
        }),
    };

    const [updatedMapping] = await db
        .update(complianceMappings)
        .set(updateValues)
        .where(eq(complianceMappings.id, existingMapping.id))
        .returning();

    if (!updatedMapping) {
        throw new ComplianceError(
            "Failed to update compliance mapping",
            500
        );
    }

    return updatedMapping;
}