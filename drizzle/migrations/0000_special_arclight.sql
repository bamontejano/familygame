CREATE TYPE "public"."mission_status" AS ENUM('pending', 'completed', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."redemption_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'parent', 'child');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('mission_earned', 'reward_redeemed', 'manual_adjustment');--> statement-breakpoint
CREATE TABLE "coinTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"relatedId" integer,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "familyRelations" (
	"id" serial PRIMARY KEY NOT NULL,
	"parentId" integer NOT NULL,
	"childId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitationCodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"parentId" integer NOT NULL,
	"code" varchar(8) NOT NULL,
	"expiresAt" timestamp,
	"usedBy" integer,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitationCodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"parentId" integer NOT NULL,
	"childId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"rewardCoins" integer DEFAULT 10 NOT NULL,
	"status" "mission_status" DEFAULT 'pending' NOT NULL,
	"dueDate" timestamp,
	"completedAt" timestamp,
	"approvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeemedRewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"childId" integer NOT NULL,
	"rewardId" integer NOT NULL,
	"costCoins" integer NOT NULL,
	"status" "redemption_status" DEFAULT 'pending' NOT NULL,
	"redeemedAt" timestamp DEFAULT now() NOT NULL,
	"processedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"parentId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"costCoins" integer NOT NULL,
	"icon" varchar(50),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
