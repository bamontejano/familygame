import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Family relationships (parent-child)
export const familyRelations = mysqlTable("family_relations", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull(),
  childId: int("childId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FamilyRelation = typeof familyRelations.$inferSelect;
export type InsertFamilyRelation = typeof familyRelations.$inferInsert;

// Missions (tasks assigned by parents to children)
export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull(),
  childId: int("childId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // "cleaning", "study", "sports", "other"
  rewardCoins: int("rewardCoins").notNull().default(10),
  status: mysqlEnum("status", ["pending", "completed", "approved", "rejected"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

// Rewards (items children can redeem with coins)
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  costCoins: int("costCoins").notNull(),
  icon: varchar("icon", { length: 50 }), // emoji or icon name
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

// Coin transactions (track all coin movements)
export const coinTransactions = mysqlTable("coin_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // positive for earned, negative for spent
  type: mysqlEnum("type", ["mission_earned", "reward_redeemed", "manual_adjustment"]).notNull(),
  relatedId: int("relatedId"), // mission ID or reward ID
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = typeof coinTransactions.$inferInsert;

// Redeemed rewards (track what children have redeemed)
export const redeemedRewards = mysqlTable("redeemed_rewards", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  rewardId: int("rewardId").notNull(),
  costCoins: int("costCoins").notNull(), // store cost at time of redemption
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type RedeemedReward = typeof redeemedRewards.$inferSelect;
export type InsertRedeemedReward = typeof redeemedRewards.$inferInsert;

// Invitation codes (for parents to invite children)
export const invitationCodes = mysqlTable("invitation_codes", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull(),
  code: varchar("code", { length: 8 }).notNull().unique(), // e.g., "ABC12345"
  usedBy: int("usedBy"), // child ID who used this code
  usedAt: timestamp("usedAt"),
  expiresAt: timestamp("expiresAt"), // optional expiration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvitationCode = typeof invitationCodes.$inferSelect;
export type InsertInvitationCode = typeof invitationCodes.$inferInsert;
