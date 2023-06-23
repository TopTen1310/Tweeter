import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQueryClient } from "@tanstack/react-query";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import superjson from "superjson";
import CreateTweet from "../components/home/CreateTweet";
import NoTweet from "../components/home/NoTweet";
import ToFollow from "../components/home/ToFollow";
import Tweet from "../components/layout/Tweet";
import { appRouter } from "../server/api/root";
import { createInnerTRPCContext } from "../server/api/trpc";
import { api } from "../utils/api";
import { getQueryKey } from "@trpc/react-query";

const Home = ({
  userSession,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: allTweets } = api.tweet.getTweets.useQuery(
    undefined, // no input
    { enabled: userSession?.user !== undefined }
  );

  const { data: suggestToFollow } = api.follow.suggestToFollow.useQuery(
    undefined, // no input
    { enabled: userSession?.user !== undefined, refetchOnMount: true }
  );

  const queryClient = useQueryClient();
  const [parent] = useAutoAnimate();

  return (
    <main className="mx-auto flex w-[80rem] max-w-full flex-col-reverse gap-6 py-6 px-4 md:grid md:grid-cols-4">
      <section className="md:col-span-3">
        {userSession?.user !== undefined ? (
          <>
            <CreateTweet queryClient={queryClient} userSession={userSession} />
            <ul ref={parent} className="space-y-7 py-6">
              {allTweets ? (
                allTweets.map((t) => (
                  <Tweet
                    key={t.id}
                    tweet={t}
                    userSession={userSession}
                    queryClient={queryClient}
                    dataKey={getQueryKey(
                      api.tweet.getTweets,
                      undefined,
                      "query"
                    )}
                  />
                ))
              ) : (
                <NoTweet />
              )}
            </ul>
          </>
        ) : (
          <NoTweet />
        )}
      </section>
      <aside className="space-y-6 md:col-span-1">
        {/* <Trends /> */}
        {userSession?.user && <ToFollow suggestToFollow={suggestToFollow} />}
      </aside>
    </main>
  );
};

export default Home;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userSession = await getSession(context);

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: userSession }),
    transformer: superjson,
  });

  await ssg.tweet.getTweets.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userSession,
    },
  };
}
