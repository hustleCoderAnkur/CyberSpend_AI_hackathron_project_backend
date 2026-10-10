import { eq, and } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    datasets,
    workspaces,
    organizations,
} from "../../db/schema.js";

import type {
    CreateDatasetInput,
    UpdateDatasetStatusInput,
} from "./datasets.schema.js";

export class DatasetError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "DatasetError";
    }
}

async function verifyWorkspaceAccess(
    workspaceId: string,
    userId: string
): Promise<void> {
    const [workspace] = await db
        .select({
            id: workspaces.id,
        })
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
        throw new DatasetError(
            "Workspace not found or access denied",
            404
        );
    }
}

export async function createDataset(
    input: CreateDatasetInput,
    userId: string
) {
    await verifyWorkspaceAccess(input.workspaceId, userId);

    const [dataset] = await db
        .insert(datasets)
        .values({
            workspaceId: input.workspaceId,
            name: input.name,
            sourceType: input.sourceType,
            status: "pending",
            uploadedBy: userId,
        })
        .returning({
            id: datasets.id,
            workspaceId: datasets.workspaceId,
            name: datasets.name,
            sourceType: datasets.sourceType,
            status: datasets.status,
            fileUrl: datasets.fileUrl,
            uploadedBy: datasets.uploadedBy,
            createdAt: datasets.createdAt,
        });

    if (!dataset) {
        throw new DatasetError("Failed to create dataset", 500);
    }

    return dataset;
}

export async function getDatasetsByWorkspace(
    workspaceId: string,
    userId: string
) {
    await verifyWorkspaceAccess(workspaceId, userId);

    return db
        .select({
            id: datasets.id,
            workspaceId: datasets.workspaceId,
            name: datasets.name,
            sourceType: datasets.sourceType,
            status: datasets.status,
            fileUrl: datasets.fileUrl,
            uploadedBy: datasets.uploadedBy,
            createdAt: datasets.createdAt,
        })
        .from(datasets)
        .where(eq(datasets.workspaceId, workspaceId));
}

export async function getDatasetById(
    datasetId: string,
    userId: string
) {
    const [dataset] = await db
        .select({
            id: datasets.id,
            workspaceId: datasets.workspaceId,
            name: datasets.name,
            sourceType: datasets.sourceType,
            status: datasets.status,
            fileUrl: datasets.fileUrl,
            uploadedBy: datasets.uploadedBy,
            createdAt: datasets.createdAt,
        })
        .from(datasets)
        .where(eq(datasets.id, datasetId))
        .limit(1);

    if (!dataset) {
        throw new DatasetError("Dataset not found", 404);
    }

    await verifyWorkspaceAccess(dataset.workspaceId, userId);

    return dataset;
}

export async function updateDatasetStatus(
    datasetId: string,
    input: UpdateDatasetStatusInput,
    userId: string
) {
    const dataset = await getDatasetById(datasetId, userId);

    const [updatedDataset] = await db
        .update(datasets)
        .set({
            status: input.status,
        })
        .where(eq(datasets.id, dataset.id))
        .returning({
            id: datasets.id,
            workspaceId: datasets.workspaceId,
            name: datasets.name,
            sourceType: datasets.sourceType,
            status: datasets.status,
            fileUrl: datasets.fileUrl,
            uploadedBy: datasets.uploadedBy,
            createdAt: datasets.createdAt,
        });

    if (!updatedDataset) {
        throw new DatasetError("Failed to update dataset status", 500);
    }

    return updatedDataset;
}