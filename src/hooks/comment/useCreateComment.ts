import type { QueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
  tweetID: string;
  setText: Dispatch<SetStateAction<string>>;
  setPhoto: Dispatch<
    SetStateAction<{
      name: string;
      url: string;
    }>
  >;
}

export default function useCreateComment({
  queryClient,
  setText,
  setPhoto,
  tweetID,
}: Props) {
  const { mutate, isLoading } = api.comment.createComment.useMutation({
    onSuccess: (data) => {
      setText("");
      setPhoto({ name: "", url: "" });
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
            return [data];
          }
          return [data, ...old];
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
                    _count: { ...d._count, comments: d._count.comments + 1 },
                  }
                : { ...d }
            ),
          ];
        }
      );
    },
    onError: (err) => {
      console.log(err);
      toast.error("Server error. Please try again later😓");
    },
  });

  return { mutate, isLoading };
}
