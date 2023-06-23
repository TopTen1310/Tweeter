import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import type { RouterOutputs } from "../../utils/api";

interface Props {
  profileUserID: string;
  loggedInUserID: string;
  from: "BIO" | "FOLLOWING" | "FOLLOWED";
}

export default function useUnfollowUser({
  profileUserID,
  loggedInUserID,
  from,
}: Props) {
  const utils = api.useContext();

  const { mutate, isLoading } = api.follow.unFollowUser.useMutation({
    onError: (err) => {
      console.log(err);
      toast.error("Server error. Please try again later😓");
    },
    onSuccess: async (data) => {
      toast.success("Successfully un followed");
      try {
        if (from === "BIO") {
          utils.user.getUser.setData(
            { userID: profileUserID },
            (old: RouterOutputs["user"]["getUser"] | undefined) => {
              if (old === undefined) return old;
              return {
                ...old,
                followedBy: [],
                _count: {
                  ...old._count,
                  followedBy: old._count.followedBy - 1,
                },
              };
            }
          );
          await utils.follow.getFollowedBy.invalidate({
            userID: profileUserID,
          });
        } else if (from === "FOLLOWING") {
          if (profileUserID === loggedInUserID) {
            utils.follow.getFollowing.setData(
              { userID: profileUserID },
              (old: RouterOutputs["follow"]["getFollowing"] | undefined) => {
                if (!old) return old;
                return [...old.filter((u) => u.id !== data)];
              }
            );

            await utils.follow.getFollowedBy.invalidate({
              userID: profileUserID,
            });

            utils.user.getUser.setData(
              { userID: profileUserID },
              (old: RouterOutputs["user"]["getUser"] | undefined) => {
                if (old === undefined) return old;
                return {
                  ...old,
                  _count: {
                    ...old._count,
                    following: old._count.following - 1,
                  },
                };
              }
            );
          } else {
            utils.follow.getFollowing.setData(
              { userID: profileUserID },
              (old: RouterOutputs["follow"]["getFollowing"] | undefined) => {
                if (old === undefined) return old;
                return [
                  ...old.map((u) =>
                    u.id === data
                      ? {
                          ...u,
                          followedByIDs: [
                            ...u.followedByIDs.filter(
                              (f) => f !== loggedInUserID
                            ),
                          ],
                        }
                      : u
                  ),
                ];
              }
            );
          }
        } else if (from === "FOLLOWED") {
          if (profileUserID === loggedInUserID) {
            utils.user.getUser.setData(
              { userID: profileUserID },
              (old: RouterOutputs["user"]["getUser"] | undefined) => {
                if (old === undefined) return old;
                return {
                  ...old,
                  _count: {
                    ...old._count,
                    following: old._count.following - 1,
                  },
                };
              }
            );

            await utils.follow.getFollowing.invalidate({
              userID: profileUserID,
            });
          }

          utils.follow.getFollowedBy.setData(
            { userID: profileUserID },
            (old: RouterOutputs["follow"]["getFollowedBy"] | undefined) => {
              if (old === undefined) return old;
              return [
                ...old.map((u) =>
                  u.id === data
                    ? {
                        ...u,
                        followedByIDs: [
                          ...u.followedByIDs.filter(
                            (f) => f !== loggedInUserID
                          ),
                        ],
                      }
                    : u
                ),
              ];
            }
          );
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  return { mutate, isLoading };
}
