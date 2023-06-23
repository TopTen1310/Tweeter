import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { newsRouter } from "./routers/news";
import { tweetRouter } from "./routers/tweet";
import { commentRouter } from "./routers/comment";
import { followRouter } from "./routers/follow";
import { userRouter } from "./routers/user";
import { exploreRouter } from "./routers/explore";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  news: newsRouter,
  tweet: tweetRouter,
  comment: commentRouter,
  follow: followRouter,
  user: userRouter,
  explore: exploreRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
