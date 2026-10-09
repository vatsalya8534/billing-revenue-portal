-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "userName" TEXT,
    "action" "AuditAction" NOT NULL,
    "model" TEXT NOT NULL,
    "recordId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "changes" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_model_createdAt_idx" ON "AuditLog"("model", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- Activity Log module for existing databases. Seed upserts the same route.
INSERT INTO "Module" ("id", "name", "description", "route", "status", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Activity Log', 'Activity Log', '/admin/activity-log', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Module" WHERE "route" = '/admin/activity-log'
);

INSERT INTO "RoleModule" ("id", "roleId", "moduleId", "canView", "canCreate", "canEdit", "canDelete")
SELECT gen_random_uuid(), r."id", m."id", true, true, true, true
FROM "Role" r
JOIN "Module" m ON m."route" = '/admin/activity-log'
WHERE r."name" ILIKE '%admin%'
AND NOT EXISTS (
    SELECT 1
    FROM "RoleModule" rm
    WHERE rm."roleId" = r."id"
      AND rm."moduleId" = m."id"
);
