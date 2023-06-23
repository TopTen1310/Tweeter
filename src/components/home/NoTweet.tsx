import { Card } from "flowbite-react";

export default function NoTweet() {
  return (
    <Card>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Welcome to Tweeter!
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        This is the best place to see what’s happening in your world. Find some
        people and topics to follow now.
      </p>
    </Card>
  );
}
