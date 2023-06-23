import { useAutoAnimate } from "@formkit/auto-animate/react";
import { api } from "../../utils/api";
import { Spinner } from "flowbite-react";
import Tweet from "../layout/Tweet";
import { getQueryKey } from "@trpc/react-query";
import type { Session } from "next-auth";
import { useQueryClient } from "@tanstack/react-query";
import NoTweet from "../home/NoTweet";

interface Props {
  profileUserId: string;
  isCurrentUser: boolean;
  userSession: Session;
}

export default function TweetTab({
  profileUserId,
  isCurrentUser,
  userSession,
}: Props) {
  const { data: tweets, isLoading: tweetsLoading } =
    api.user.userTweets.useQuery(
      {
        userID: profileUserId,
      },
      { enabled: isCurrentUser, refetchOnMount: true }
    );
  const [parent] = useAutoAnimate();
  const queryClient = useQueryClient();

  return (
    <ul ref={parent} className="space-y-7 md:col-span-3">
      {tweetsLoading ? (
        <div className="mt-6 flex justify-center">
          <Spinner size="lg" aria-label="Default status example" />
        </div>
      ) : tweets && tweets.length ? (
        tweets.map((t) => (
          <Tweet
            key={t.id}
            tweet={t}
            userSession={userSession}
            queryClient={queryClient}
            dataKey={getQueryKey(
              api.user.userTweets,
              { userID: profileUserId },
              "query"
            )}
          />
        ))
      ) : (
        <NoTweet />
      )}
    </ul>
  );
}
