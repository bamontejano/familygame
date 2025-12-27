import { and, eq, gt, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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
  
  const result = await db.insert(users).values(newUser);
  
  return { 
    id: result[0].insertId, 
    ...newUser 
  };
}

// ============ MISSIONS ============

export async function createMission(data: InsertMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(missions).values(data);
  return result[0].insertId;
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
  const result = await db.insert(rewards).values(data);
  return result[0].insertId;
}

export async function getRewardsByParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rewards).where(and(eq(rewards.parentId, parentId), eq(rewards.isActive, true)));
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
  const result = await db.insert(coinTransactions).values(data);
  return result[0].insertId;
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
  const result = await db.insert(redeemedRewards).values(data);
  return result[0].insertId;
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
  const result = await db.insert(familyRelations).values(data);
  return result[0].insertId;
}

export async function getChildrenByParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyRelations).where(eq(familyRelations.parentId, parentId));
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
  const result = await db.insert(invitationCodes).values({
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