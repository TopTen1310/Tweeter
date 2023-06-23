import type { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
  userID: string;
  tweetID: string;
}

export default function useLikeComment({
  queryClient,
  userID,
  tweetID,
}: Props) {
  const { mutate } = api.comment.likeComment.useMutation({
    // * When mutate is called:
    onMutate: async ({ likeID, commentID, newLikeID }) => {
      // * Cancel any outgoing refetches
      // * (so they don't overwrite the optimistic update)
      try {
        await queryClient.cancelQueries({
          queryKey: [
            ["comment", "getComments"],
            {
              input: tweetID,
              type: "query",
            },
          ],
        });

        // * Snapshot the previous value
        const previousComments = <RouterOutputs["comment"]["getComments"]>(
          queryClient.getQueryData([
            ["comment", "getComments"],
            {
              input: tweetID,
              type: "query",
            },
          ])
        );

        // * Optimistically update to the new value
        queryClient.setQueryData(
          [
            ["comment", "getComments"],
            {
              input: tweetID,
              type: "query",
            },
          ],
          (old: RouterOutputs["comment"]["getComments"] | undefined) => {
            if (old === undefined) {
              return old;
            }
            return [
              ...old.map((d) =>
                d.id === commentID
                  ? likeID
                    ? {
                        ...d,
                        likes: [],
                        _count: { likes: d._count.likes - 1 },
                      }
                    : {
                        ...d,
                        _count: { likes: d._count.likes + 1 },
                        likes: [
                          {
                            id: newLikeID,
                            commentId: commentID,
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
        return { previousComments };
      } catch (err) {
        console.log(err);
      }
    },
    // * If the mutation fails,
    // * use the context returned from onMutate to roll back
    onError: (err, newComment, context) => {
      console.log(err);
      toast.error("Server error! Please try again later😓");
      queryClient.setQueryData(
        [
          ["comment", "getComments"],
          {
            input: tweetID,
            type: "query",
          },
        ],
        context?.previousComments
      );
    },
    // * Always refetch after error or success:
    onSettled: async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: [
            ["comment", "getComments"],
            {
              input: tweetID,
              type: "query",
            },
          ],
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

  return { mutate };
}
