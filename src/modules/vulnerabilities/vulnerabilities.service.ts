import { eq, and } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    vulnerabilities,
    assets,
    organizations,
} from "../../db/schema.js";

import type {
    CreateVulnerabilityInput,
    UpdateVulnerabilityInput,
} from "./vulnerabilities.schema.js";

export class VulnerabilityError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "VulnerabilityError";
    }
}

async function verifyAssetAccess(
    assetId: string,
    userId: string
): Promise<void> {
    const [asset] = await db
        .select({
            id: assets.id,
        })
        .from(assets)
        .innerJoin(
            organizations,
            eq(assets.organizationId, organizations.id)
        )
        .where(
            and(
                eq(assets.id, assetId),
                eq(organizations.createdBy, userId)
            )
        )
        .limit(1);

    if (!asset) {
        throw new VulnerabilityError(
            "Asset not found or access denied",
            404
        );
    }
}

export async function createVulnerability(
    input: CreateVulnerabilityInput,
    userId: string
) {
    await verifyAssetAccess(input.assetId, userId);

    const [vulnerability] = await db
        .insert(vulnerabilities)
        .values({
            assetId: input.assetId,
            cveId: input.cveId ?? null,
            severity: input.severity,
            cvssScore: input.cvssScore?.toFixed(2) ?? null,
            remediationStatus: input.remediationStatus,
        })
        .returning({
            id: vulnerabilities.id,
            assetId: vulnerabilities.assetId,
            cveId: vulnerabilities.cveId,
            severity: vulnerabilities.severity,
            cvssScore: vulnerabilities.cvssScore,
            remediationStatus: vulnerabilities.remediationStatus,
        });

    if (!vulnerability) {
        throw new VulnerabilityError(
            "Failed to create vulnerability",
            500
        );
    }

    return vulnerability;
}

export async function getVulnerabilitiesByAsset(
    assetId: string,
    userId: string
) {
    await verifyAssetAccess(assetId, userId);

    return db
        .select({
            id: vulnerabilities.id,
            assetId: vulnerabilities.assetId,
            cveId: vulnerabilities.cveId,
            severity: vulnerabilities.severity,
            cvssScore: vulnerabilities.cvssScore,
            remediationStatus: vulnerabilities.remediationStatus,
        })
        .from(vulnerabilities)
        .where(eq(vulnerabilities.assetId, assetId));
}

export async function getVulnerabilityById(
    vulnerabilityId: string,
    userId: string
) {
    const [vulnerability] = await db
        .select({
            id: vulnerabilities.id,
            assetId: vulnerabilities.assetId,
            cveId: vulnerabilities.cveId,
            severity: vulnerabilities.severity,
            cvssScore: vulnerabilities.cvssScore,
            remediationStatus: vulnerabilities.remediationStatus,
        })
        .from(vulnerabilities)
        .where(eq(vulnerabilities.id, vulnerabilityId))
        .limit(1);

    if (!vulnerability) {
        throw new VulnerabilityError(
            "Vulnerability not found",
            404
        );
    }

    await verifyAssetAccess(vulnerability.assetId, userId);

    return vulnerability;
}

export async function updateVulnerability(
    vulnerabilityId: string,
    input: UpdateVulnerabilityInput,
    userId: string
) {
    const existingVulnerability = await getVulnerabilityById(
        vulnerabilityId,
        userId
    );

    const updateValues = {
        ...(input.cveId !== undefined && {
            cveId: input.cveId,
        }),
        ...(input.severity !== undefined && {
            severity: input.severity,
        }),
        ...(input.cvssScore !== undefined && {
            cvssScore: input.cvssScore?.toFixed(2) ?? null,
        }),
        ...(input.remediationStatus !== undefined && {
            remediationStatus: input.remediationStatus,
        }),
    };

    const [updatedVulnerability] = await db
        .update(vulnerabilities)
        .set(updateValues)
        .where(eq(vulnerabilities.id, existingVulnerability.id))
        .returning({
            id: vulnerabilities.id,
            assetId: vulnerabilities.assetId,
            cveId: vulnerabilities.cveId,
            severity: vulnerabilities.severity,
            cvssScore: vulnerabilities.cvssScore,
            remediationStatus: vulnerabilities.remediationStatus,
        });

    if (!updatedVulnerability) {
        throw new VulnerabilityError(
            "Failed to update vulnerability",
            500
        );
    }

    return updatedVulnerability;
}