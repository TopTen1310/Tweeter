import axios from "axios";
import type { RootArticle } from "../../../utils/types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const newsRouter = createTRPCRouter({
  getNews: publicProcedure.query(async () => {
    const res = await axios.get<RootArticle>(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${
        process.env.NEWS_API_KEY ? process.env.NEWS_API_KEY : ""
      }`
    );
    return res.data;
  }),
});
