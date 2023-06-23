import { z } from "zod";

const idSchema = z.string().length(24);

const countSchema = z.object({
  retweets: z.number().min(0),
  likes: z.number().min(0),
  comments: z.number().min(0),
  Bookmark: z.number().min(0),
});

const userSchema = z.object({
  id: idSchema,
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.string().datetime().nullable(),
  image: z.string().url(),
  followedByIDs: z.array(idSchema),
  followingIDs: z.array(idSchema),
});

const likeRetweetBookmarkSchema = z.object({
  id: idSchema,
  userId: idSchema,
  tweetId: idSchema,
});

const tweetSchema = z.object({
  id: idSchema,
  userId: idSchema,
  image: z.string().url().optional(),
  imageID: z.string().min(3).optional(),
  text: z.string(),
  authorized: z.enum(["PUBLIC", "FOLLOWER"]),
  createdAt: z.string().datetime(),
  retweets: z.array(likeRetweetBookmarkSchema).min(0).max(1),
  likes: z.array(likeRetweetBookmarkSchema).min(0).max(1),
  Bookmark: z.array(likeRetweetBookmarkSchema).min(0).max(1),
  user: userSchema,
  _count: countSchema,
});

export const tweetsSchema = z.array(tweetSchema);
