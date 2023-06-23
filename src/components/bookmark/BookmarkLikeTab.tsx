import { useAutoAnimate } from "@formkit/auto-animate/react";
import { api } from "../../utils/api";
import { Spinner } from "flowbite-react";
import Tweet from "../layout/Tweet";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import NoTweet from "../home/NoTweet";

interface Props {
  userSession: Session;
}

export default function BookmarkLikeTab({ userSession }: Props) {
  const [parent] = useAutoAnimate();
  const queryClient = useQueryClient();
  const { data, isLoading } = api.user.userBookmarkedLikes.useQuery(undefined, {
    refetchOnMount: true,
  });

  return (
    <ul ref={parent} className="space-y-7 md:col-span-3">
      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <Spinner size="lg" aria-label="Default status example" />
        </div>
      ) : data && data.length ? (
        data.map((t) => (
          <Tweet
            key={t.id}
            tweet={t}
            userSession={userSession}
            queryClient={queryClient}
            dataKey={getQueryKey(
              api.user.userBookmarkedLikes,
              undefined,
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
