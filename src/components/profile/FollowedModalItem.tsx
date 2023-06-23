import type { Session } from "next-auth";
import type { RouterOutputs } from "../../utils/api";
import Link from "next/link";
import useUnfollowUser from "../../hooks/user/useUnfollowUser";
import { Button, Spinner } from "flowbite-react";
import useProfileFollow from "../../hooks/user/useProfileFollow";

interface Props {
  user: RouterOutputs["follow"]["getFollowing"][number];
  userSession: Session;
  profileUserId: string;
}

export default function FollowedModalItem({
  user,
  userSession,
  profileUserId,
}: Props) {
  const { mutate: unFollowMutate, isLoading: unFollowLoading } =
    useUnfollowUser({
      profileUserID: profileUserId,
      loggedInUserID: userSession.user.id,
      from: "FOLLOWED",
    });

  const { mutate: followMutate, isLoading: followLoading } = useProfileFollow({
    profileUserID: profileUserId,
    loggedInUserID: userSession.user.id,
    from: "FOLLOWED",
  });

  return (
    <li className="border-0 border-b-2 border-solid border-gray-200 py-3 sm:py-4">
      <div className="flex flex-wrap justify-between space-x-4">
        <div className="flex items-center sm:space-x-4">
          <Link href={`/profile/${user.id}`}>
            <img
              className="hidden h-9 w-9 shrink-0 rounded-lg sm:block"
              src={
                user.image ||
                "https://flowbite.com/docs/images/people/profile-picture-2.jpg"
              }
              alt="user pic"
            />
          </Link>
          <div className="flex-1">
            <Link href={`/profile/${user.id}`}>
              <p className="truncate text-base font-bold text-gray-900 dark:text-white">
                {user.name}
              </p>
            </Link>
            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {user.followedByIDs.length} followers
            </p>
          </div>
        </div>
        {user.id !== userSession.user.id ? (
          user.followedByIDs.includes(userSession.user.id) ? (
            <Button
              onClick={() => unFollowMutate({ unFollowUserID: user.id })}
              color="failure"
              className={`text-center ${
                unFollowLoading ? "pointer-events-none" : "pointer-events-auto"
              }`}
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
              onClick={() => followMutate({ followUserID: user.id })}
              className={`text-center ${
                followLoading ? "pointer-events-none" : "pointer-events-auto"
              }`}
            >
              {followLoading ? (
                <Spinner aria-label="Default status example" size="md" />
              ) : (
                "Follow"
              )}
            </Button>
          )
        ) : null}
      </div>
      <p className="mt-3 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </p>
    </li>
  );
}
