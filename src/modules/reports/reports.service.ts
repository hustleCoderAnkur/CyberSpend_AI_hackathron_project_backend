
import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    assessments,
    assessmentRuns,
    organizations,
    reports,
    workspaces,
} from "../../db/schema.js";

import type { CreateReportInput } from "./reports.schema.js";

export class ReportError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "ReportError";
    }
}

async function verifyAssessmentRunAccess(
    assessmentRunId: string,
    userId: string,
) {
    const [run] = await db
        .select({
            id: assessmentRuns.id,
        })
        .from(assessmentRuns)
        .innerJoin(
            assessments,
            eq(assessmentRuns.assessmentId, assessments.id),
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
                eq(assessmentRuns.id, assessmentRunId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!run) {
        throw new ReportError(
            "Assessment run not found or access denied",
            404,
        );
    }

    return run;
}

async function verifyReportAccess(
    reportId: string,
    userId: string,
) {
    const [report] = await db
        .select({
            id: reports.id,
        })
        .from(reports)
        .innerJoin(
            assessmentRuns,
            eq(reports.assessmentRunId, assessmentRuns.id),
        )
        .innerJoin(
            assessments,
            eq(assessmentRuns.assessmentId, assessments.id),
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
                eq(reports.id, reportId),
                eq(organizations.createdBy, userId),
            ),
        )
        .limit(1);

    if (!report) {
        throw new ReportError(
            "Report not found or access denied",
            404,
        );
    }

    return report;
}

export async function createReport(
    input: CreateReportInput,
    userId: string,
) {
    await verifyAssessmentRunAccess(input.assessmentRunId, userId);

    const [createdReport] = await db
        .insert(reports)
        .values({
            assessmentRunId: input.assessmentRunId,
            createdBy: userId,
            reportType: input.reportType,
            fileUrl: input.fileUrl ?? null,
        })
        .returning();

    return createdReport;
}

export async function getReportsByAssessmentRun(
    assessmentRunId: string,
    userId: string,
) {
    await verifyAssessmentRunAccess(assessmentRunId, userId);

    return db
        .select()
        .from(reports)
        .where(eq(reports.assessmentRunId, assessmentRunId))
        .orderBy(desc(reports.createdAt));
}

export async function getReportById(
    reportId: string,
    userId: string,
) {
    await verifyReportAccess(reportId, userId);

    const [report] = await db
        .select()
        .from(reports)
        .where(eq(reports.id, reportId))
        .limit(1);

    if (!report) {
        throw new ReportError("Report not found", 404);
    }

    return report;
}
