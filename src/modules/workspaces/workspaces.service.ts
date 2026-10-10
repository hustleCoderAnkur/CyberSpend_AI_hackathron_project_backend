import { eq, and } from "drizzle-orm";

import { db } from "../../db/index.js";
import { organizations, workspaces } from "../../db/schema.js";

import type {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
} from "./workspaces.schema.js";

export class WorkspaceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "WorkspaceError";
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
        throw new WorkspaceError(
            "Organization not found or access denied",
            404
        );
    }
}

export async function createWorkspace(
    input: CreateWorkspaceInput,
    userId: string
) {
    await verifyOrganizationAccess(input.organizationId, userId);

    const [workspace] = await db
        .insert(workspaces)
        .values({
            organizationId: input.organizationId,
            name: input.name,
        })
        .returning({
            id: workspaces.id,
            organizationId: workspaces.organizationId,
            name: workspaces.name,
        });

    if (!workspace) {
        throw new WorkspaceError("Failed to create workspace", 500);
    }

    return workspace;
}

export async function getOrganizationWorkspaces(
    organizationId: string,
    userId: string
) {
    await verifyOrganizationAccess(organizationId, userId);

    return db
        .select({
            id: workspaces.id,
            organizationId: workspaces.organizationId,
            name: workspaces.name,
        })
        .from(workspaces)
        .where(eq(workspaces.organizationId, organizationId));
}

export async function getWorkspaceById(
    workspaceId: string,
    userId: string
) {
    const [workspace] = await db
        .select({
            id: workspaces.id,
            organizationId: workspaces.organizationId,
            name: workspaces.name,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

    if (!workspace) {
        throw new WorkspaceError("Workspace not found", 404);
    }

    await verifyOrganizationAccess(workspace.organizationId, userId);

    return workspace;
}

export async function updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceInput,
    userId: string
) {
    const workspace = await getWorkspaceById(workspaceId, userId);

    const [updatedWorkspace] = await db
        .update(workspaces)
        .set({
            name: input.name,
        })
        .where(eq(workspaces.id, workspace.id))
        .returning({
            id: workspaces.id,
            organizationId: workspaces.organizationId,
            name: workspaces.name,
        });

    if (!updatedWorkspace) {
        throw new WorkspaceError("Failed to update workspace", 500);
    }

    return updatedWorkspace;
}