-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_code" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 5,
    "userId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientRunId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agentVersion" TEXT,
    "status" TEXT NOT NULL,
    "scoreCard" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_result" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skipReason" TEXT,
    "scoreCard" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "error" TEXT,
    "validatorResults" JSONB NOT NULL,

    CONSTRAINT "benchmark_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry_event" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "clientEventId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "benchmarkId" TEXT,
    "agentName" TEXT,
    "payload" JSONB NOT NULL,
    "durationMs" INTEGER,

    CONSTRAINT "telemetry_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "api_token_userId_idx" ON "api_token"("userId");

-- CreateIndex
CREATE INDEX "api_token_tokenHash_idx" ON "api_token"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "device_code_deviceCode_key" ON "device_code"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "device_code_userCode_key" ON "device_code"("userCode");

-- CreateIndex
CREATE INDEX "device_code_userCode_idx" ON "device_code"("userCode");

-- CreateIndex
CREATE INDEX "run_userId_createdAt_idx" ON "run"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "run_agentName_idx" ON "run"("agentName");

-- CreateIndex
CREATE UNIQUE INDEX "run_userId_clientRunId_key" ON "run"("userId", "clientRunId");

-- CreateIndex
CREATE INDEX "benchmark_result_runId_idx" ON "benchmark_result"("runId");

-- CreateIndex
CREATE INDEX "benchmark_result_benchmarkId_idx" ON "benchmark_result"("benchmarkId");

-- CreateIndex
CREATE INDEX "benchmark_result_category_idx" ON "benchmark_result"("category");

-- CreateIndex
CREATE INDEX "telemetry_event_runId_seq_idx" ON "telemetry_event"("runId", "seq");

-- CreateIndex
CREATE INDEX "telemetry_event_runId_type_idx" ON "telemetry_event"("runId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "telemetry_event_runId_clientEventId_key" ON "telemetry_event"("runId", "clientEventId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_token" ADD CONSTRAINT "api_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_code" ADD CONSTRAINT "device_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run" ADD CONSTRAINT "run_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_result" ADD CONSTRAINT "benchmark_result_runId_fkey" FOREIGN KEY ("runId") REFERENCES "run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry_event" ADD CONSTRAINT "telemetry_event_runId_fkey" FOREIGN KEY ("runId") REFERENCES "run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
