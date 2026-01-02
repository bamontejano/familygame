import { and, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  missions,
  InsertMission,
  rewards,
  InsertReward,
  coinTransactions,
  InsertCoinTransaction,
  redeemedRewards,
  InsertRedeemedReward,
  familyRelations,
  InsertFamilyRelation,
  invitationCodes,
  InsertInvitationCode,
} from "../drizzle/schema.js";
import { ENV } from "./_core/env.js";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// El resto del código es igual, solo cambia la forma de conectar
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const openId = `email_${data.email}_${Date.now()}`;
  const newUser = {
    openId,
    email: data.email,
    name: data.name,
    role: data.role,
    loginMethod: "email",
    lastSignedIn: new Date(),
  };

  const result = await db.insert(users).values(newUser).returning();
  return result[0];
}

// ============ MISSIONS ============

export async function createMission(data: InsertMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(missions).values(data).returning();
  return result[0].id;
}

export async function getMissionsByChild(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(missions).where(eq(missions.childId, childId));
}

export async function getMissionsByParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(missions).where(eq(missions.parentId, parentId));
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMission(id: number, data: Partial<InsertMission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(missions).set(data).where(eq(missions.id, id));
}

export async function deleteMission(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(missions).where(eq(missions.id, id));
}

// ============ REWARDS ============

export async function createReward(data: InsertReward) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(rewards).values(data).returning();
  return result[0].id;
}

export async function getRewardsByParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rewards).where(and(eq(rewards.parentId, parentId), eq(rewards.isActive, true)));
}

export async function getRewardsByChild(childId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get parents of this child
  const parents = await db.select().from(familyRelations).where(eq(familyRelations.childId, childId));
  const parentIds = parents.map(p => p.parentId);

  if (parentIds.length === 0) return [];

  return db.select().from(rewards).where(
    and(
      inArray(rewards.parentId, parentIds),
      eq(rewards.isActive, true)
    )
  );
}

export async function getRewardById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateReward(id: number, data: Partial<InsertReward>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rewards).set(data).where(eq(rewards.id, id));
}

export async function deleteReward(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(rewards).where(eq(rewards.id, id));
}

// ============ COIN TRANSACTIONS ============

export async function createCoinTransaction(data: InsertCoinTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coinTransactions).values(data).returning();
  return result[0].id;
}

export async function getUserCoinBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select()
    .from(coinTransactions)
    .where(eq(coinTransactions.userId, userId));
  return result.reduce((sum, tx) => sum + tx.amount, 0);
}

export async function getUserCoinTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coinTransactions).where(eq(coinTransactions.userId, userId));
}

// ============ REDEEMED REWARDS ============

export async function createRedeemedReward(data: InsertRedeemedReward) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(redeemedRewards).values(data).returning();
  return result[0].id;
}

export async function getRedeemedRewardsByChild(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(redeemedRewards).where(eq(redeemedRewards.childId, childId));
}

export async function getRedeemedRewardById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(redeemedRewards).where(eq(redeemedRewards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRedeemedReward(id: number, data: Partial<InsertRedeemedReward>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(redeemedRewards).set(data).where(eq(redeemedRewards.id, id));
}

export async function getPendingRedeemedRewardsByChildren(childIds: number[]) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: redeemedRewards.id,
      childId: redeemedRewards.childId,
      rewardId: redeemedRewards.rewardId,
      costCoins: redeemedRewards.costCoins,
      status: redeemedRewards.status,
      redeemedAt: redeemedRewards.redeemedAt,
      childName: users.name,
      rewardTitle: rewards.title,
      rewardIcon: rewards.icon,
    })
    .from(redeemedRewards)
    .innerJoin(users, eq(redeemedRewards.childId, users.id))
    .innerJoin(rewards, eq(redeemedRewards.rewardId, rewards.id))
    .where(
      and(
        inArray(redeemedRewards.childId, childIds),
        eq(redeemedRewards.status, "pending")
      )
    );
}

// ============ FAMILY RELATIONS ============

export async function createFamilyRelation(data: InsertFamilyRelation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyRelations).values(data).returning();
  return result[0].id;
}

export async function getChildrenByParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];

  // Agregamos la suma de transacciones para obtener el saldo real
  return db
    .select({
      id: familyRelations.id,
      parentId: familyRelations.parentId,
      childId: familyRelations.childId,
      createdAt: familyRelations.createdAt,
      childName: users.name,
      childEmail: users.email,
      coinBalance: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`.mapWith(Number),
    })
    .from(familyRelations)
    .innerJoin(users, eq(familyRelations.childId, users.id))
    .leftJoin(coinTransactions, eq(coinTransactions.userId, familyRelations.childId))
    .where(eq(familyRelations.parentId, parentId))
    .groupBy(familyRelations.id, users.id);
}

export async function getParentsByChild(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyRelations).where(eq(familyRelations.childId, childId));
}

// ============ INVITATION CODES ============

export function generateInvitationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createInvitationCode(parentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = generateInvitationCode();
  await db.insert(invitationCodes).values({
    parentId,
    code,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return code;
}

export async function getInvitationCodeByParent(parentId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(invitationCodes)
    .where(eq(invitationCodes.parentId, parentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function validateAndUseInvitationCode(code: string, childId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(invitationCodes)
    .where(eq(invitationCodes.code, code))
    .limit(1);

  if (result.length === 0) throw new Error("Invalid invitation code");

  const inviteCode = result[0];
  if (inviteCode.usedBy) throw new Error("Invitation code already used");
  if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
    throw new Error("Invitation code expired");
  }

  await db
    .update(invitationCodes)
    .set({ usedBy: childId, usedAt: new Date() })
    .where(eq(invitationCodes.id, inviteCode.id));

  await createFamilyRelation({
    parentId: inviteCode.parentId,
    childId,
  });

  return inviteCode.parentId;
}

export async function updateStreak(userId: number) {
  const db = await getDb();
  if (!db) return;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return;
  const userData = user[0];

  const now = new Date();
  const lastUpdate = userData.lastStreakUpdate;

  if (!lastUpdate) {
    // First time
    await db.update(users).set({
      currentStreak: 1,
      lastStreakUpdate: now
    }).where(eq(users.id, userId));
    return;
  }

  const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If last update was yesterday (< 48h and different day... simple check: dates diff)
  // Actually better check: is it the same day?
  const isSameDay = now.toDateString() === lastUpdate.toDateString();

  if (isSameDay) {
    // Already updated today
    return;
  }

  // Check if it was yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === lastUpdate.toDateString();

  if (isYesterday) {
    await db.update(users).set({
      currentStreak: userData.currentStreak + 1,
      lastStreakUpdate: now
    }).where(eq(users.id, userId));
  } else {
    // Reset streak
    await db.update(users).set({
      currentStreak: 1,
      lastStreakUpdate: now
    }).where(eq(users.id, userId));
  }
}