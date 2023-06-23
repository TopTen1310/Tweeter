import { TRPCError } from "@trpc/server";
import { z } from "zod";
import cloudinary from "../../../utils/cloudinaryConfig";
import { formatError } from "../../../utils/utilityFunctions";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  getComments: protectedProcedure
    .input(z.string())
    .query(async ({ ctx: { prisma, session }, input: tweetID }) => {
      try {
        const comments = await prisma.comment.findMany({
          where: {
            Tweet: {
              id: tweetID,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
            _count: {
              select: {
                likes: true,
              },
            },
            likes: {
              where: {
                user: {
                  id: session.user.id,
                },
              },
            },
          },
        });
        return comments;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),

  createComment: protectedProcedure
    .input(
      z.object({
        comment: z.string(),
        image: z.string(),
        tweetID: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { comment, image, tweetID },
      }) => {
        try {
          const photoUrl = image
            ? await cloudinary.uploader.upload(image)
            : undefined;

          const newComment = await prisma.comment.create({
            data: {
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: tweetID,
                },
              },
              text: comment,
              image: photoUrl?.url,
              imageID: photoUrl?.public_id,
            },
            include: {
              user: true,
              _count: {
                select: {
                  likes: true,
                },
              },
              likes: {
                where: {
                  user: {
                    id: session.user.id,
                  },
                },
              },
            },
          });

          return newComment;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),
  deleteComment: protectedProcedure
    .input(z.object({ commentID: z.string(), imageID: z.string().optional() }))
    .mutation(async ({ ctx: { prisma }, input: { commentID, imageID } }) => {
      try {
        imageID && (await cloudinary.uploader.destroy(imageID));
        const comment = await prisma.comment.delete({
          where: {
            id: commentID,
          },
        });
        return comment;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  likeComment: protectedProcedure
    .input(
      z.object({
        likeID: z.string().optional(),
        commentID: z.string(),
        newLikeID: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { likeID, commentID, newLikeID },
      }) => {
        try {
          if (likeID) {
            const deletedLike = await prisma.commentLike.delete({
              where: {
                id: likeID,
              },
            });

            return deletedLike;
          }

          const likeComment = await prisma.commentLike.create({
            data: {
              id: newLikeID,
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Comment: {
                connect: {
                  id: commentID,
                },
              },
            },
          });

          return likeComment;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),
});
