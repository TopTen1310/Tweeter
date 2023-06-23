import { Avatar, Button, Card, Spinner } from "flowbite-react";
import type { Session } from "next-auth";
import type { Dispatch, SetStateAction } from "react";
import useProfileFollow from "../../hooks/user/useProfileFollow";
import useUnfollowUser from "../../hooks/user/useUnfollowUser";
import type { RouterOutputs } from "../../utils/api";

interface UserBioProps {
  setToggleModal: Dispatch<SetStateAction<boolean>>;
  setFollowedToggleModal: Dispatch<SetStateAction<boolean>>;
  user: RouterOutputs["user"]["getUser"];
  userSession: Session;
}

export default function UserBio({
  setToggleModal,
  setFollowedToggleModal,
  user,
  userSession,
}: UserBioProps) {
  // ? Follow user mutation
  const { mutate: followUser, isLoading: followLoading } = useProfileFollow({
    loggedInUserID: userSession.user.id,
    from: "BIO",
  });

  // ? Un follow user mutation
  const { mutate: unFollowUser, isLoading: unFollowLoading } = useUnfollowUser({
    loggedInUserID: userSession.user.id,
    profileUserID: user.id,
    from: "BIO",
  });

  function userFollow() {
    followUser({ followUserID: user.id });
  }

  function userUnFollow() {
    unFollowUser({ unFollowUserID: user.id });
  }

  return (
    <Card className="relative z-10 -mt-10">
      <section className="flex max-w-full gap-6">
        <Avatar
          img={
            user.image ||
            "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
          }
          size="xl"
          className="-mt-16 hidden sm:block"
        />
        <article className="max-w-full flex-1">
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-wrap items-center gap-x-5">
              <h5 className="text-xl font-bold capitalize tracking-tight text-gray-900 dark:text-white">
                {user.name}
              </h5>
              <p
                onClick={() => setToggleModal(true)}
                className="cursor-pointer text-sm font-semibold text-gray-500 dark:text-gray-400"
              >
                <span className="font-bold text-gray-600">
                  {user._count.following}{" "}
                </span>
                Following
              </p>
              <p
                onClick={() => setFollowedToggleModal(true)}
                className="cursor-pointer text-sm font-semibold text-gray-500 dark:text-gray-400"
              >
                <span className="font-bold text-gray-600">
                  {user._count.followedBy}{" "}
                </span>
                Followers
              </p>
            </div>
            {userSession &&
              userSession.user.id !== user.id &&
              (user.followedBy.length ? (
                <Button
                  color="failure"
                  className={`text-center ${
                    unFollowLoading
                      ? "pointer-events-none"
                      : "pointer-events-auto"
                  }`}
                  onClick={userUnFollow}
                >
                  {unFollowLoading ? (
                    <Spinner
                      color="failure"
                      aria-label="Default status example"
                      size="md"
                    />
                  ) : (
                    "Un Follow"
                  )}
                </Button>
              ) : (
                <Button
                  className={`text-center ${
                    followLoading
                      ? "pointer-events-none"
                      : "pointer-events-auto"
                  }`}
                  onClick={userFollow}
                >
                  {followLoading ? (
                    <Spinner aria-label="Default status example" size="md" />
                  ) : (
                    "Follow"
                  )}
                </Button>
              ))}
          </div>

          <p className="mt-2 w-96 max-w-full font-medium text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi,
            minima!
          </p>
        </article>
      </section>
    </Card>
  );
}
