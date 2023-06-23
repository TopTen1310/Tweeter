import { TRPCError } from "@trpc/server";
import { z } from "zod";
import cloudinary from "../../../utils/cloudinaryConfig";
import { formatError } from "../../../utils/utilityFunctions";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const reusedInclude = {
  user: true,
  _count: {
    select: {
      retweets: true,
      likes: true,
      Bookmark: true,
      comments: true,
    },
  },
};

// function didUser(input: string, userID: string) {
//   return {
//     $filter: {
//       input,
//       as: "l",
//       cond: {
//         $eq: [{ $toObjectId: userID }, "$$l.userId"],
//       },
//     },
//   };
// }

// function formatLRB(field: string) {
//   return {
//     id: { $toString: { $first: `${field}._id` } },
//     userId: { $toString: { $first: `${field}.userId` } },
//     tweetId: { $toString: { $first: `${field}.tweetId` } },
//   };
// }

// function convertToStringID(input: string) {
//   return {
//     $map: {
//       input,
//       as: "f",
//       in: { $toString: "$$f" },
//     },
//   };
// }

export const tweetRouter = createTRPCRouter({
  createTweet: protectedProcedure
    .input(
      z.object({
        image: z.string().optional(),
        text: z.string(),
        authorized: z.enum(["PUBLIC", "FOLLOWER"]),
      })
    )
    .mutation(async ({ input, ctx: { prisma, session } }) => {
      try {
        const photoUrl = input.image
          ? await cloudinary.uploader.upload(input.image)
          : undefined;

        const newTweet = await prisma.tweet.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            image: photoUrl?.url,
            imageID: photoUrl?.public_id,
            text: input.text,
            authorized: input.authorized,
          },
          include: {
            ...reusedInclude,
            retweets: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            likes: true,
            Bookmark: true,
          },
        });
        return newTweet;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),

  // test: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
  //   try {
  //     return await prisma.$transaction(async (tx) => {
  //       const followingUser = await tx.user.findUnique({
  //         where: {
  //           id: session.user.id,
  //         },
  //         select: {
  //           followingIDs: true,
  //         },
  //       });

  //       const following = followingUser ? followingUser.followingIDs : [];

  //       const retweets = await tx.tweet.aggregateRaw({
  //         // local: tweet, foreign: lookup[from]. In lookup localField is the field in local and foreign field is the field in lookup[from] that is connected with the local field
  //         pipeline: [
  //           {
  //             $lookup: {
  //               from: "Retweet",
  //               localField: "_id",
  //               foreignField: "tweetId",
  //               as: "tweetRetweets",
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "TweetLike",
  //               localField: "_id",
  //               foreignField: "tweetId",
  //               as: "tweetLikes",
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "Comment",
  //               localField: "_id",
  //               foreignField: "tweetId",
  //               as: "comments",
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "Bookmark",
  //               localField: "_id",
  //               foreignField: "tweetId",
  //               as: "tweetBookmarks",
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "User",
  //               localField: "userId",
  //               foreignField: "_id",
  //               as: "user",
  //             },
  //           },
  //           {
  //             $set: {
  //               user: { $first: "$user" },
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "User",
  //               let: {
  //                 allRetweets: "$tweetRetweets",
  //                 tweetUser: "$user",
  //               },
  //               pipeline: [
  //                 {
  //                   $match: {
  //                     $expr: {
  //                       $in: [
  //                         { $toString: "$_id" },
  //                         {
  //                           $map: {
  //                             input: "$$allRetweets",
  //                             as: "n",
  //                             in: {
  //                               $cond: {
  //                                 if: {
  //                                   $or: [
  //                                     {
  //                                       $eq: [
  //                                         { $toString: "$$n.userId" },
  //                                         session.user.id,
  //                                       ],
  //                                     },
  //                                     {
  //                                       $in: [
  //                                         { $toString: "$$n.userId" },
  //                                         following,
  //                                       ],
  //                                     },
  //                                   ],
  //                                 },
  //                                 then: { $toString: "$$n.userId" },
  //                                 else: "",
  //                               },
  //                             },
  //                           },
  //                         },
  //                       ],
  //                     },
  //                   },
  //                 },
  //               ],
  //               as: "allRetweeters",
  //             },
  //           },
  //           {
  //             $match: {
  //               $or: [
  //                 {
  //                   $expr: {
  //                     $eq: ["$userId", { $toObjectId: session.user.id }],
  //                   },
  //                 },
  //                 {
  //                   $expr: {
  //                     $in: [
  //                       { $toObjectId: session.user.id },
  //                       "$user.followedByIDs",
  //                     ],
  //                   },
  //                 },
  //                 {
  //                   $expr: {
  //                     $gt: [{ $size: "$allRetweeters" }, 0],
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //           {
  //             $set: {
  //               id: { $toString: "$_id" },
  //               user: {
  //                 $mergeObjects: [
  //                   "$user",
  //                   {
  //                     id: { $toString: "$user._id" },
  //                     followedByIDs: convertToStringID("$user.followedByIDs"),
  //                     followingIDs: convertToStringID("$user.followingIDs"),
  //                   },
  //                 ],
  //               },
  //               userId: { $toString: "$userId" },
  //               createdAt: { $toString: "$createdAt" },
  //               _count: {
  //                 retweets: { $size: "$tweetRetweets" },
  //                 likes: { $size: "$tweetLikes" },
  //                 comments: { $size: "$comments" },
  //                 Bookmark: { $size: "$tweetBookmarks" },
  //               },
  //               likes: didUser("$tweetLikes", session.user.id),
  //               Bookmark: didUser("$tweetBookmarks", session.user.id),
  //               retweets: didUser("$tweetRetweets", session.user.id),
  //               retweetersInfo: {
  //                 $map: {
  //                   input: "$allRetweeters",
  //                   as: "r",
  //                   in: {
  //                     id: { $toString: "$$r._id" },
  //                     name: "$$r.name",
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           {
  //             $set: {
  //               likes: formatLRB("$likes"),
  //               Bookmark: formatLRB("$Bookmark"),
  //               retweets: formatLRB("$retweets"),
  //             },
  //           },
  //           {
  //             $unset: [
  //               "user._id",
  //               "likes._id",
  //               "Bookmark._id",
  //               "retweets._id",
  //               "allRetweeters",
  //               "comments",
  //               "tweetLikes",
  //               "tweetBookmarks",
  //               "tweetRetweets",
  //               "_id",
  //             ],
  //           },
  //         ],
  //       });

  //       tweetsSchema.parse(retweets);

  //       return retweets as unknown as z.infer<typeof tweetsSchema>;
  //       // return retweets;
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     throw new TRPCError(formatError(err));
  //   }
  // }),

  getTweets: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const followingUser = await tx.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            followingIDs: true,
          },
        });

        const following = followingUser ? followingUser.followingIDs : [];

        const reusedWhere = {
          user: {
            id: session.user.id,
          },
        };

        const tweets = await tx.tweet.findMany({
          where: {
            OR: [
              {
                user: {
                  id: {
                    in: [session.user.id, ...following],
                  },
                },
              },
              {
                retweets: {
                  some: { userId: { in: [session.user.id, ...following] } },
                },
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            ...reusedInclude,
            retweets: {
              where: { userId: { in: [session.user.id, ...following] } },
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
          },
        });
        return tweets;
      });
    } catch (err) {
      console.log(err);
      throw new TRPCError(formatError(err));
    }
  }),

  deleteTweet: protectedProcedure
    .input(z.object({ tweetID: z.string(), imageID: z.string().optional() }))
    .mutation(async ({ ctx: { prisma }, input: { tweetID, imageID } }) => {
      try {
        imageID && (await cloudinary.uploader.destroy(imageID));

        const tweet = await prisma.tweet.delete({
          where: {
            id: tweetID,
          },
        });

        return tweet;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),

  likeTweet: protectedProcedure
    .input(
      z.object({
        likeID: z.string().optional(),
        twitterID: z.string(),
        newLikeID: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { likeID, twitterID, newLikeID },
      }) => {
        try {
          if (likeID) {
            const deletedLike = await prisma.tweetLike.delete({
              where: {
                id: likeID,
              },
            });

            return deletedLike;
          }

          const likedTweet = await prisma.tweetLike.create({
            data: {
              id: newLikeID,
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: twitterID,
                },
              },
            },
          });

          return likedTweet;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),

  bookmarkTweet: protectedProcedure
    .input(
      z.object({
        bookmarkID: z.string().optional(),
        twitterID: z.string(),
        newBookmarkID: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { session, prisma },
        input: { bookmarkID, twitterID, newBookmarkID },
      }) => {
        try {
          if (bookmarkID) {
            const deletedBookmark = await prisma.bookmark.delete({
              where: {
                id: bookmarkID,
              },
            });

            return deletedBookmark;
          }

          const bookmarkedTweet = await prisma.bookmark.create({
            data: {
              id: newBookmarkID,
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: twitterID,
                },
              },
            },
          });

          return bookmarkedTweet;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),
  retweetTweet: protectedProcedure
    .input(
      z.object({
        retweetID: z.string().optional(),
        twitterID: z.string(),
        newRetweetID: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { session, prisma },
        input: { retweetID, twitterID, newRetweetID },
      }) => {
        try {
          if (retweetID) {
            const deletedRetweet = await prisma.retweet.delete({
              where: {
                id: retweetID,
              },
            });

            return deletedRetweet;
          }

          const retweetedTweet = await prisma.retweet.create({
            data: {
              id: newRetweetID,
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: twitterID,
                },
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
          });

          return retweetedTweet;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),
});
