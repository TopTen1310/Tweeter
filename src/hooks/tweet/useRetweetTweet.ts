import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
  userID: string;
  name: string | null;
  dataKey: QueryKey;
}

export default function useRetweetTweet({
  queryClient,
  userID,
  name,
  dataKey,
}: Props) {
  const { mutate } = api.tweet.retweetTweet.useMutation({
    // * When mutate is called:
    onMutate: async ({ retweetID, twitterID, newRetweetID }) => {
      try {
        console.log(newRetweetID);
        // * Cancel any outgoing refetches
        // * (so they don't overwrite the optimistic update)
        await queryClient.cancelQueries({
          queryKey: dataKey,
        });

        // * Snapshot the previous value
        const previousTweets = <RouterOutputs["tweet"]["getTweets"]>(
          queryClient.getQueryData(dataKey)
        );

        // * Optimistically update to the new value
        queryClient.setQueryData(
          dataKey,
          (old: RouterOutputs["tweet"]["getTweets"] | undefined) => {
            if (old === undefined) {
              return old;
            }
            return [
              ...old.map((d) =>
                d.id === twitterID
                  ? retweetID
                    ? {
                        ...d,
                        retweets: [
                          ...d.retweets.filter((r) => r.id === retweetID),
                        ],
                        _count: {
                          ...d._count,
                          retweets: d._count.retweets - 1,
                        },
                      }
                    : {
                        ...d,
                        _count: {
                          ...d._count,
                          retweets: d._count.retweets + 1,
                        },
                        retweets: [
                          ...d.retweets,
                          {
                            id: newRetweetID,
                            tweetId: twitterID,
                            userId: userID,
                            user: {
                              id: userID,
                              name,
                            },
                          },
                        ],
                      }
                  : { ...d }
              ),
            ];
          }
        );

        // * Return a context object with the snapshotted value
        return { previousTweets };
      } catch (err) {
        console.log(err);
      }
    },
    // * If the mutation fails,
    // * use the context returned from onMutate to roll back
    onError: (err, newTweet, context) => {
      console.log(err);
      toast.error("Server error! Please try again later😓");
      queryClient.setQueryData(dataKey, context?.previousTweets);
    },
    // * Always refetch after error or success:
    onSettled: async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: dataKey,
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

  return { mutate };
}
