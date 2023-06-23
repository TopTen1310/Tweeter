import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
  userID: string;
  dataKey: QueryKey;
}

export default function useLikeTweet({ queryClient, userID, dataKey }: Props) {
  const { mutate } = api.tweet.likeTweet.useMutation({
    // * When mutate is called:
    onMutate: async ({ likeID, twitterID, newLikeID }) => {
      // * Cancel any outgoing refetches
      // * (so they don't overwrite the optimistic update)
      try {
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
                  ? likeID
                    ? {
                        ...d,
                        likes: [],
                        _count: { ...d._count, likes: d._count.likes - 1 },
                      }
                    : {
                        ...d,
                        _count: { ...d._count, likes: d._count.likes + 1 },
                        likes: [
                          {
                            id: newLikeID,
                            tweetId: twitterID,
                            userId: userID,
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
