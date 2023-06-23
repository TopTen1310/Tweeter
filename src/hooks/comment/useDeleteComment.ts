import type { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
  tweetID: string;
}

export default function useDeleteComment({ queryClient, tweetID }: Props) {
  const { mutate, isLoading } = api.comment.deleteComment.useMutation({
    onSuccess: (data) => {
      toast.success("Deleted successfully😊");
      queryClient.setQueryData(
        [
          ["comment", "getComments"],
          {
            input: tweetID,
            type: "query",
          },
        ],
        (oldData: RouterOutputs["tweet"]["getTweets"] | undefined) => {
          if (oldData === undefined) {
            return oldData;
          }
          return [...oldData.filter((d) => d.id !== data.id)];
        }
      );
      queryClient.setQueryData(
        [
          ["tweet", "getTweets"],
          {
            type: "query",
          },
        ],
        (old: RouterOutputs["tweet"]["getTweets"] | undefined) => {
          if (old === undefined) return old;
          return [
            ...old.map((d) =>
              d.id === tweetID
                ? {
                    ...d,
                    _count: { ...d._count, comments: d._count.comments - 1 },
                  }
                : { ...d }
            ),
          ];
        }
      );
    },
    onError: (err) => {
      console.log(err);
      toast.error("Server Error. Please try again later😓");
    },
  });

  return { mutate, isLoading };
}
