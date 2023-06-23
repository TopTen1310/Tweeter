import type { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
}

export default function useDeleteTweet({ queryClient }: Props) {
  const { mutate, isLoading } = api.tweet.deleteTweet.useMutation({
    onSuccess: (data) => {
      toast.success("Deleted successfully😊");
      queryClient.setQueryData(
        [
          ["tweet", "getTweets"],
          {
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
    },
    onError: (err) => {
      console.log(err);
      toast.error("Server Error. Please try again later😓");
    },
  });

  return { mutate, isLoading };
}
