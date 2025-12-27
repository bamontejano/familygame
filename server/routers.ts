import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import { sdk } from "./_core/sdk.js";
import * as db from "./db.js";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    signIn: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) throw new Error("Usuario no encontrado");
        
        // En una aplicación real, aquí verificaríamos la contraseña.
        // Para este prototipo, asumimos que es correcta si el usuario existe.

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { 
          success: true, 
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            role: user.role,
            loginMethod: user.loginMethod,
            lastSignedIn: user.lastSignedIn.toISOString(),
          },
          sessionToken 
        };
      }),
    signUp: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
          role: z.enum(["parent", "child"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) throw new Error("El correo electrónico ya está en uso");
        
        const user = await db.createUser({
          email: input.email,
          name: input.name,
          role: input.role,
          password: input.password,
        });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { 
          success: true, 
          user: {
            ...user,
            lastSignedIn: new Date().toISOString(),
          },
          sessionToken 
        };
      }),
    getInvitationCode: protectedProcedure.query(({ ctx }) =>
      db.getInvitationCodeByParent(ctx.user.id)
    ),
    useInvitationCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        const parentId = await db.validateAndUseInvitationCode(input.code, ctx.user.id);
        return { success: true, parentId };
      }),
  }),

  missions: router({
    listByChild: protectedProcedure.query(({ ctx }) =>
      db.getMissionsByChild(ctx.user.id)
    ),
    listByParent: protectedProcedure.query(({ ctx }) =>
      db.getMissionsByParent(ctx.user.id)
    ),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getMissionById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          category: z.string().min(1).max(50),
          rewardCoins: z.number().int().positive().default(10),
          dueDate: z.date().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createMission({
          parentId: ctx.user.id,
          childId: input.childId,
          title: input.title,
          description: input.description,
          category: input.category,
          rewardCoins: input.rewardCoins,
          dueDate: input.dueDate,
          status: "pending",
        })
      ),
    markCompleted: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) =>
        db.updateMission(input.id, {
          status: "completed",
          completedAt: new Date(),
        })
      ),
    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const mission = await db.getMissionById(input.id);
        if (!mission) throw new Error("Mission not found");
        if (mission.parentId !== ctx.user.id) throw new Error("Unauthorized");

        await db.updateMission(input.id, {
          status: "approved",
          approvedAt: new Date(),
        });

        await db.createCoinTransaction({
          userId: mission.childId,
          amount: mission.rewardCoins,
          type: "mission_earned",
          relatedId: input.id,
          description: `Completed: ${mission.title}`,
        });
      }),
    reject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) =>
        db.updateMission(input.id, {
          status: "rejected",
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteMission(input.id)),
  }),

  rewards: router({
    listByParent: protectedProcedure.query(({ ctx }) =>
      db.getRewardsByParent(ctx.user.id)
    ),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getRewardById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          costCoins: z.number().int().positive(),
          icon: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createReward({
          parentId: ctx.user.id,
          title: input.title,
          description: input.description,
          costCoins: input.costCoins,
          icon: input.icon,
          isActive: true,
        })
      ),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          costCoins: z.number().int().positive().optional(),
          icon: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => db.updateReward(input.id, input)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteReward(input.id)),
  }),

  coins: router({
    getBalance: protectedProcedure.query(({ ctx }) =>
      db.getUserCoinBalance(ctx.user.id)
    ),
    getTransactions: protectedProcedure.query(({ ctx }) =>
      db.getUserCoinTransactions(ctx.user.id)
    ),
    redeem: protectedProcedure
      .input(z.object({ rewardId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const reward = await db.getRewardById(input.rewardId);
        if (!reward) throw new Error("Recompensa no encontrada");

        const balance = await db.getUserCoinBalance(ctx.user.id);
        if (balance < reward.costCoins) throw new Error("Monedas insuficientes");

        await db.createRedeemedReward({
          childId: ctx.user.id,
          rewardId: input.rewardId,
          costCoins: reward.costCoins,
          status: "pending",
        });
      }),
    approveRedemption: protectedProcedure
      .input(z.object({ redemptionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const redemption = await db.getRedeemedRewardById(input.redemptionId);
        if (!redemption) throw new Error("Solicitud no encontrada");
        
        const reward = await db.getRewardById(redemption.rewardId);
        if (!reward) throw new Error("Recompensa no encontrada");
        
        if (reward.parentId !== ctx.user.id) throw new Error("No autorizado");

        await db.createCoinTransaction({
          userId: redemption.childId,
          amount: -redemption.costCoins,
          type: "reward_redeemed",
          relatedId: redemption.rewardId,
          description: `Canjeado: ${reward.title}`,
        });

        await db.updateRedeemedReward(input.redemptionId, {
          status: "approved",
          processedAt: new Date(),
        });
      }),
    rejectRedemption: protectedProcedure
      .input(z.object({ redemptionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const redemption = await db.getRedeemedRewardById(input.redemptionId);
        if (!redemption) throw new Error("Solicitud no encontrada");
        
        const reward = await db.getRewardById(redemption.rewardId);
        if (!reward) throw new Error("Recompensa no encontrada");
        
        if (reward.parentId !== ctx.user.id) throw new Error("No autorizado");

        await db.updateRedeemedReward(input.redemptionId, {
          status: "rejected",
          processedAt: new Date(),
        });
      }),
  }),

  family: router({
    getChildren: protectedProcedure.query(({ ctx }) =>
      db.getChildrenByParent(ctx.user.id)
    ),
    getParents: protectedProcedure.query(({ ctx }) =>
      db.getParentsByChild(ctx.user.id)
    ),
    addChild: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .mutation(({ ctx, input }) =>
        db.createFamilyRelation({
          parentId: ctx.user.id,
          childId: input.childId,
        })
      ),
    generateInvitationCode: protectedProcedure.mutation(({ ctx }) =>
      db.createInvitationCode(ctx.user.id)
    ),
  }),

  redeemedRewards: router({
    listByChild: protectedProcedure.query(({ ctx }) =>
      db.getRedeemedRewardsByChild(ctx.user.id)
    ),
    listPendingByParent: protectedProcedure.query(async ({ ctx }) => {
      const children = await db.getChildrenByParent(ctx.user.id);
      const childIds = children.map(c => c.childId);
      if (childIds.length === 0) return [];
      return db.getPendingRedeemedRewardsByChildren(childIds);
    }),
  })
});

export type AppRouter = typeof appRouter;