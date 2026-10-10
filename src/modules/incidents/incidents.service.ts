import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    securityIncidents,
    organizations,
} from "../../db/schema.js";

import type {
    CreateIncidentInput,
    UpdateIncidentInput,
} from "./incidents.schema.js";

export class IncidentError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "IncidentError";
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
        throw new IncidentError(
            "Organization not found or access denied",
            404
        );
    }
}

// Create incident
export async function createIncident(
    input: CreateIncidentInput,
    userId: string
) {
    await verifyOrganizationAccess(input.organizationId, userId);

    const [incident] = await db
        .insert(securityIncidents)
        .values({
            organizationId: input.organizationId,
            assetId: input.assetId ?? null,
            title: input.title,
            severity: input.severity,
            status: input.status,
        })
        .returning();

    if (!incident) {
        throw new IncidentError("Failed to create incident", 500);
    }

    return incident;
}

// Get incidents by organization
export async function getIncidentsByOrganization(
    organizationId: string,
    userId: string
) {
    await verifyOrganizationAccess(organizationId, userId);

    return db
        .select()
        .from(securityIncidents)
        .where(eq(securityIncidents.organizationId, organizationId));
}

// Get incident by ID
export async function getIncidentById(
    incidentId: string,
    userId: string
) {
    const [incident] = await db
        .select()
        .from(securityIncidents)
        .where(eq(securityIncidents.id, incidentId))
        .limit(1);

    if (!incident) {
        throw new IncidentError("Incident not found", 404);
    }

    await verifyOrganizationAccess(incident.organizationId, userId);

    return incident;
}

// Update incident
export async function updateIncident(
    incidentId: string,
    input: UpdateIncidentInput,
    userId: string
) {
    const existingIncident = await getIncidentById(
        incidentId,
        userId
    );

    const updateValues = {
        ...(input.assetId !== undefined && {
            assetId: input.assetId,
        }),
        ...(input.title !== undefined && {
            title: input.title,
        }),
        ...(input.severity !== undefined && {
            severity: input.severity,
        }),
        ...(input.status !== undefined && {
            status: input.status,
        }),
    };

    const [updatedIncident] = await db
        .update(securityIncidents)
        .set(updateValues)
        .where(eq(securityIncidents.id, existingIncident.id))
        .returning();

    if (!updatedIncident) {
        throw new IncidentError("Failed to update incident", 500);
    }

    return updatedIncident;
}