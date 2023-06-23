import Link from "next/link";
import type { RouterOutputs } from "../../utils/api";
import { Button, Spinner } from "flowbite-react";
import useProfileFollow from "../../hooks/user/useProfileFollow";

interface Props {
  suggestedUser: RouterOutputs["follow"]["suggestToFollow"][number];
}

export default function FollowUser({ suggestedUser }: Props) {
  // ? Follow user mutation
  const { mutate: followUser, isLoading: followLoading } = useProfileFollow({
    from: "SUGGEST",
  });

  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center lg:space-x-4">
        <Link href={`/profile/${suggestedUser.id}`}>
          <img
            className="hidden h-8 w-8 shrink-0 rounded-full lg:block"
            src={suggestedUser.image ?? undefined}
            alt="Michael image"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${suggestedUser.id}`}>
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {suggestedUser.name}
            </p>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {suggestedUser.email}
            </p>
          </Link>
        </div>
        <Button
          size="xs"
          onClick={() => followUser({ followUserID: suggestedUser.id })}
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
      </div>
    </li>
  );
}
