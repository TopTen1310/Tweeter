import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { formatError } from "../../../utils/utilityFunctions";
import { createTRPCRouter, protectedProcedure } from "../trpc";

interface ReusedIncludeProps {
  profileUserID?: string;
  loggedInUserID: string;
}

function reusedInclude({ profileUserID, loggedInUserID }: ReusedIncludeProps) {
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
          id: profileUserID
            ? {
                in: [profileUserID, loggedInUserID],
              }
            : loggedInUserID,
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

function userIdFromArray(userID: string) {
  return {
    some: {
      user: {
        id: userID,
      },
    },
  };
}

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ userID: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { userID } }) => {
      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: {
            id: userID,
          },
          select: {
            _count: {
              select: {
                following: true,
                followedBy: true,
              },
            },
            followedBy: {
              where: {
                id: session.user.id,
              },
              select: {
                id: true,
              },
            },
            image: true,
            name: true,
            id: true,
          },
        });

        return user;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),

  userTweets: protectedProcedure
    .input(z.object({ userID: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { userID } }) => {
      try {
        const tweets = await prisma.tweet.findMany({
          where: {
            OR: [
              {
                user: {
                  id: userID,
                },
              },
              {
                retweets: userIdFromArray(userID),
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude({
            profileUserID: userID,
            loggedInUserID: session.user.id,
          }),
        });

        return tweets;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  userMedia: protectedProcedure
    .input(z.object({ userID: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { userID } }) => {
      try {
        const tweetsWithMedia = await prisma.tweet.findMany({
          where: {
            user: {
              id: userID,
            },
            image: {
              not: null,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude({
            profileUserID: userID,
            loggedInUserID: session.user.id,
          }),
        });
        return tweetsWithMedia;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  userLikes: protectedProcedure
    .input(z.object({ userID: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { userID } }) => {
      try {
        const tweetsWithLikes = await prisma.tweet.findMany({
          where: {
            likes: userIdFromArray(userID),
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude({
            profileUserID: userID,
            loggedInUserID: session.user.id,
          }),
        });

        return tweetsWithLikes;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  userBookmarks: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      try {
        const bookmarkedTweets = await prisma.tweet.findMany({
          where: {
            Bookmark: userIdFromArray(session.user.id),
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude({ loggedInUserID: session.user.id }),
        });

        return bookmarkedTweets;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }
  ),
  userBookmarkedLikes: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      try {
        const bookmarkedLikes = await prisma.tweet.findMany({
          where: {
            Bookmark: userIdFromArray(session.user.id),
            likes: userIdFromArray(session.user.id),
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude({ loggedInUserID: session.user.id }),
        });

        return bookmarkedLikes;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }
  ),
  userBookmarkedMedia: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      try {
        const bookmarkedMedia = await prisma.tweet.findMany({
          where: {
            Bookmark: userIdFromArray(session.user.id),
            image: {
              not: null,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: reusedInclude({ loggedInUserID: session.user.id }),
        });

        return bookmarkedMedia;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }
  ),
});
