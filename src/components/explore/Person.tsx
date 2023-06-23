import { Avatar, Card } from "flowbite-react";
import type { RouterOutputs } from "../../utils/api";
import Link from "next/link";

interface Props {
  user: RouterOutputs["explore"]["topUsers"][number];
}

export default function Person({ user }: Props) {
  return (
    <Card>
      <Avatar
        img={
          user.image ||
          "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
        }
        size="lg"
      />
      <Link href={`/profile/${user.id}`}>
        <h5 className="text-center text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {user.name}
        </h5>
      </Link>
      <p className="text-center font-normal text-gray-700 dark:text-gray-400">
        {user._count.followedBy} followers
      </p>
    </Card>
  );
}
