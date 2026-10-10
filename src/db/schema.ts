import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    decimal,
    jsonb,
    unique,
    index,
} from "drizzle-orm/pg-core";

// 1. Users
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// 2. Organizations
export const organizations = pgTable("organizations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
        onDelete: "set null",
    }),
});

// 3. Memberships
export const memberships = pgTable(
    "memberships",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        role: varchar("role", { length: 50 }).notNull(),
    },
    (table) => [
        unique("memberships_user_org_unique").on(
            table.userId,
            table.organizationId
        ),
    ]
);

// 4. Workspaces
export const workspaces = pgTable("workspaces", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
});

// 5. Assets
export const assets = pgTable(
    "assets",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        assetType: varchar("asset_type", { length: 100 }).notNull(),
        criticality: varchar("criticality", { length: 50 }).notNull(),
    },
    (table) => [
        index("assets_organization_idx").on(table.organizationId),
    ]
);

// 6. Vulnerabilities
export const vulnerabilities = pgTable("vulnerabilities", {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
        .notNull()
        .references(() => assets.id, { onDelete: "cascade" }),
    cveId: varchar("cve_id", { length: 50 }),
    severity: varchar("severity", { length: 50 }).notNull(),
    cvssScore: decimal("cvss_score", {
        precision: 4,
        scale: 2,
    }),
    remediationStatus: varchar("remediation_status", { length: 50 }).notNull(),
});

// 7. Security Incidents
export const securityIncidents = pgTable("security_incidents", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id").references(() => assets.id, {
        onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    severity: varchar("severity", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
});

// 8. Security Controls
export const securityControls = pgTable("security_controls", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    cost: decimal("cost", { precision: 18, scale: 2 }).notNull(),
    effectiveness: decimal("effectiveness", {
        precision: 7,
        scale: 4,
    }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
});

// 9. Datasets
export const datasets = pgTable("datasets", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    sourceType: varchar("source_type", { length: 100 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    fileUrl: text("file_url"),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// 10. Assessments
export const assessments = pgTable("assessments", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// 11. Assessment Runs
export const assessmentRuns = pgTable(
    "assessment_runs",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        assessmentId: uuid("assessment_id")
            .notNull()
            .references(() => assessments.id, { onDelete: "cascade" }),
        runNumber: integer("run_number").notNull(),
        modelVersion: varchar("model_version", { length: 100 }).notNull(),
        inputSnapshot: jsonb("input_snapshot").notNull(),
        riskScore: decimal("risk_score", { precision: 18, scale: 4 }),
        expectedAnnualLoss: decimal("expected_annual_loss", {
            precision: 18,
            scale: 2,
        }),
        result: jsonb("result"),
        completedAt: timestamp("completed_at", { withTimezone: true }),
    },
    (table) => [
        unique("assessment_runs_number_unique").on(
            table.assessmentId,
            table.runNumber
        ),
        index("assessment_runs_assessment_idx").on(table.assessmentId),
    ]
);

// 12. Risk Factors
export const riskFactors = pgTable("risk_factors", {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentRunId: uuid("assessment_run_id")
        .notNull()
        .references(() => assessmentRuns.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id").references(() => assets.id, {
        onDelete: "set null",
    }),
    factorName: varchar("factor_name", { length: 255 }).notNull(),
    contribution: decimal("contribution", {
        precision: 18,
        scale: 6,
    }).notNull(),
    explanation: text("explanation"),
});

// 13. Recommendations
export const recommendations = pgTable("recommendations", {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentRunId: uuid("assessment_run_id")
        .notNull()
        .references(() => assessmentRuns.id, { onDelete: "cascade" }),
    securityControlId: uuid("security_control_id").references(
        () => securityControls.id,
        { onDelete: "set null" }
    ),
    title: varchar("title", { length: 255 }).notNull(),
    estimatedCost: decimal("estimated_cost", {
        precision: 18,
        scale: 2,
    }),
    expectedRiskReduction: decimal("expected_risk_reduction", {
        precision: 18,
        scale: 6,
    }),
    roi: decimal("roi", { precision: 18, scale: 4 }),
    status: varchar("status", { length: 50 }).notNull(),
});

// 14. Scenarios
export const scenarios = pgTable("scenarios", {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    budget: decimal("budget", { precision: 18, scale: 2 }),
    results: jsonb("results"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// 15. Reports
export const reports = pgTable("reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentRunId: uuid("assessment_run_id")
        .notNull()
        .references(() => assessmentRuns.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => users.id, {
        onDelete: "set null",
    }),
    reportType: varchar("report_type", { length: 100 }).notNull(),
    fileUrl: text("file_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// 16. Compliance Mappings
export const complianceMappings = pgTable("compliance_mappings", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    framework: varchar("framework", { length: 100 }).notNull(),
    requirementCode: varchar("requirement_code", { length: 100 }).notNull(),
    controlName: varchar("control_name", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
});

// 17. Audit Logs
export const auditLogs = pgTable(
    "audit_logs",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        actorUserId: uuid("actor_user_id").references(() => users.id, {
            onDelete: "set null",
        }),
        action: varchar("action", { length: 100 }).notNull(),
        resourceType: varchar("resource_type", { length: 100 }).notNull(),
        resourceId: varchar("resource_id", { length: 255 }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("audit_logs_organization_created_idx").on(
            table.organizationId,
            table.createdAt
        ),
    ]
);

// 18. Refresh Tokens
export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        tokenHash: text("token_hash").notNull().unique(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("refresh_tokens_user_idx").on(table.userId),
        index("refresh_tokens_expiry_idx").on(table.expiresAt),
    ]
);

// 19. Dataset Import Jobs
export const datasetImportJobs = pgTable(
    "dataset_import_jobs",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        datasetId: uuid("dataset_id")
            .notNull()
            .references(() => datasets.id, { onDelete: "cascade" }),
        status: varchar("status", { length: 50 }).notNull().default("pending"),
        recordsProcessed: integer("records_processed").notNull().default(0),
        recordsFailed: integer("records_failed").notNull().default(0),
        errorDetails: jsonb("error_details"),
        startedAt: timestamp("started_at", { withTimezone: true }),
        completedAt: timestamp("completed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("dataset_import_jobs_dataset_idx").on(table.datasetId),
        index("dataset_import_jobs_status_idx").on(table.status),
    ]
);

// 20. Scenario Controls
export const scenarioControls = pgTable(
    "scenario_controls",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        scenarioId: uuid("scenario_id")
            .notNull()
            .references(() => scenarios.id, { onDelete: "cascade" }),
        securityControlId: uuid("security_control_id")
            .notNull()
            .references(() => securityControls.id, { onDelete: "restrict" }),
        selectedCost: decimal("selected_cost", {
            precision: 18,
            scale: 2,
        }).notNull(),
        expectedRiskReduction: decimal("expected_risk_reduction", {
            precision: 18,
            scale: 6,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique("scenario_controls_unique").on(
            table.scenarioId,
            table.securityControlId
        ),
        index("scenario_controls_scenario_idx").on(table.scenarioId),
    ]
);