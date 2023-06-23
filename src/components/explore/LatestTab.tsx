import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Alert, Spinner } from "flowbite-react";
import type { Session } from "next-auth";
import { api } from "../../utils/api";
import Tweet from "../layout/Tweet";

interface Props {
  userSession: Session;
  srcQuery: string;
}

export default function LatestTab({ srcQuery, userSession }: Props) {
  const [parent] = useAutoAnimate();
  const queryClient = useQueryClient();

  const { data, isLoading } = api.explore.latestTweets.useQuery(
    { srcQuery },
    {
      refetchOnMount: true,
    }
  );

  return (
    <ul ref={parent} className="space-y-7 py-4 md:col-span-3">
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
              api.explore.latestTweets,
              { srcQuery },
              "query"
            )}
          />
        ))
      ) : (
        <Alert color="info">
          <span>
            <span className="font-medium">No tweets found!</span>
          </span>
        </Alert>
      )}
    </ul>
  );
}
