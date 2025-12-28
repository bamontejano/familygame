import { integer, pgTable, text, timestamp, varchar, boolean, pgEnum, serial } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "parent", "child"]);
export const missionStatusEnum = pgEnum("mission_status", ["pending", "completed", "approved", "rejected"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["mission_earned", "reward_redeemed", "manual_adjustment"]);
export const redemptionStatusEnum = pgEnum("redemption_status", ["pending", "approved", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  currentStreak: integer("currentStreak").default(0).notNull(),
  lastStreakUpdate: timestamp("lastStreakUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Missions table
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  parentId: integer("parentId").notNull(),
  childId: integer("childId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  rewardCoins: integer("rewardCoins").notNull().default(10),
  status: missionStatusEnum("status").default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Rewards table
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  parentId: integer("parentId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  costCoins: integer("costCoins").notNull(),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Coin transactions table
export const coinTransactions = pgTable("coinTransactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  amount: integer("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  relatedId: integer("relatedId"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Redeemed rewards table
export const redeemedRewards = pgTable("redeemedRewards", {
  id: serial("id").primaryKey(),
  childId: integer("childId").notNull(),
  rewardId: integer("rewardId").notNull(),
  costCoins: integer("costCoins").notNull(),
  status: redemptionStatusEnum("status").default("pending").notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

// Family relations table
export const familyRelations = pgTable("familyRelations", {
  id: serial("id").primaryKey(),
  parentId: integer("parentId").notNull(),
  childId: integer("childId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Invitation codes table
export const invitationCodes = pgTable("invitationCodes", {
  id: serial("id").primaryKey(),
  parentId: integer("parentId").notNull(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  expiresAt: timestamp("expiresAt"),
  usedBy: integer("usedBy"),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = typeof coinTransactions.$inferInsert;

export type RedeemedReward = typeof redeemedRewards.$inferSelect;
export type InsertRedeemedReward = typeof redeemedRewards.$inferInsert;

export type FamilyRelation = typeof familyRelations.$inferSelect;
export type InsertFamilyRelation = typeof familyRelations.$inferInsert;

export type InvitationCode = typeof invitationCodes.$inferSelect;
export type InsertInvitationCode = typeof invitationCodes.$inferInsert;