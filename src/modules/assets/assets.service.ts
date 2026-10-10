import { eq, and } from "drizzle-orm";

import { db } from "../../db/index.js";
import { assets, organizations } from "../../db/schema.js";

import type {
    CreateAssetInput,
    UpdateAssetInput,
} from "./assets.schema.js";

export class AssetError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "AssetError";
    }
}

async function verifyOrganizationAccess(
    organizationId: string,
    userId: string
): Promise<void> {
    const [organization] = await db
        .select({
            id: organizations.id,
        })
        .from(organizations)
        .where(
            and(
                eq(organizations.id, organizationId),
                eq(organizations.createdBy, userId)
            )
        )
        .limit(1);

    if (!organization) {
        throw new AssetError(
            "Organization not found or access denied",
            404
        );
    }
}

export async function createAsset(
    input: CreateAssetInput,
    userId: string
) {
    await verifyOrganizationAccess(input.organizationId, userId);

    const [asset] = await db
        .insert(assets)
        .values({
            organizationId: input.organizationId,
            name: input.name,
            assetType: input.assetType,
            criticality: input.criticality,
        })
        .returning({
            id: assets.id,
            organizationId: assets.organizationId,
            name: assets.name,
            assetType: assets.assetType,
            criticality: assets.criticality,
        });

    if (!asset) {
        throw new AssetError("Failed to create asset", 500);
    }

    return asset;
}

export async function getAssetsByOrganization(
    organizationId: string,
    userId: string
) {
    await verifyOrganizationAccess(organizationId, userId);

    return db
        .select({
            id: assets.id,
            organizationId: assets.organizationId,
            name: assets.name,
            assetType: assets.assetType,
            criticality: assets.criticality,
        })
        .from(assets)
        .where(eq(assets.organizationId, organizationId));
}

export async function getAssetById(
    assetId: string,
    userId: string
) {
    const [asset] = await db
        .select({
            id: assets.id,
            organizationId: assets.organizationId,
            name: assets.name,
            assetType: assets.assetType,
            criticality: assets.criticality,
        })
        .from(assets)
        .where(eq(assets.id, assetId))
        .limit(1);

    if (!asset) {
        throw new AssetError("Asset not found", 404);
    }

    await verifyOrganizationAccess(asset.organizationId, userId);

    return asset;
}

export async function updateAsset(
    assetId: string,
    input: UpdateAssetInput,
    userId: string
) {
    const asset = await getAssetById(assetId, userId);

    const [updatedAsset] = await db
        .update(assets)
        .set(input)
        .where(eq(assets.id, asset.id))
        .returning({
            id: assets.id,
            organizationId: assets.organizationId,
            name: assets.name,
            assetType: assets.assetType,
            criticality: assets.criticality,
        });

    if (!updatedAsset) {
        throw new AssetError("Failed to update asset", 500);
    }

    return updatedAsset;
}