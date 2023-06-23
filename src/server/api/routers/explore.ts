import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { formatError } from "../../../utils/utilityFunctions";
import { z } from "zod";

function reusedInclude(loggedInUserID: string) {
  const reusedWhere = {
    user: {
      id: loggedInUserID,
    },
  };
  return {
    user: true,
    _count: {
      select: {
        retweets: true,
        likes: true,
        Bookmark: true,
        comments: true,
      },
    },
    retweets: {
      where: {
        user: {
          id: loggedInUserID,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    likes: {
      where: reusedWhere,
    },
    Bookmark: {
      where: reusedWhere,
    },
  };
}

export const exploreRouter = createTRPCRouter({
  latestTweets: protectedProcedure
    .input(z.object({ srcQuery: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { srcQuery } }) => {
      try {
        const latestTweets = await prisma.tweet.findMany({
          where: {
            text: {
              contains: srcQuery,
              mode: "insensitive",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude(session.user.id),
        });

        return latestTweets;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  topTweets: protectedProcedure
    .input(z.object({ srcQuery: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { srcQuery } }) => {
      try {
        const topTweets = await prisma.tweet.findMany({
          where: {
            text: {
              contains: srcQuery,
              mode: "insensitive",
            },
          },
          orderBy: [
            {
              likes: {
                _count: "desc",
              },
            },
            { createdAt: "desc" },
          ],
          include: reusedInclude(session.user.id),
        });

        return topTweets;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  topMedia: protectedProcedure
    .input(z.object({ srcQuery: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { srcQuery } }) => {
      try {
        const topMedia = await prisma.tweet.findMany({
          where: {
            image: {
              not: null,
            },
            text: {
              contains: srcQuery,
              mode: "insensitive",
            },
          },
          orderBy: [
            {
              likes: {
                _count: "desc",
              },
            },
            { createdAt: "desc" },
          ],
          include: reusedInclude(session.user.id),
        });

        return topMedia;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  topUsers: protectedProcedure
    .input(z.object({ srcQuery: z.string() }))
    .query(async ({ ctx: { prisma }, input: { srcQuery } }) => {
      try {
        const topUsers = await prisma.user.findMany({
          where: {
            name: {
              contains: srcQuery,
              mode: "insensitive",
            },
          },
          orderBy: {
            followedBy: {
              _count: "desc",
            },
          },
          select: {
            id: true,
            name: true,
            image: true,
            _count: {
              select: {
                followedBy: true,
              },
            },
          },
        });

        return topUsers;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
});
