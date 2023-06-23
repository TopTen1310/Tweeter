import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { Avatar, Button, Card, Dropdown, Spinner } from "flowbite-react";
import type { Session } from "next-auth";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import {
  FaRegBookmark,
  FaRegCommentAlt,
  FaRegHeart,
  FaRetweet,
} from "react-icons/fa";
import useBookmarkTweet from "../../hooks/tweet/useBookmarkTweet";
import useDeleteTweet from "../../hooks/tweet/useDeleteTweet";
import useLikeTweet from "../../hooks/tweet/useLikeTweet";
import useRetweetTweet from "../../hooks/tweet/useRetweetTweet";
import type { RouterOutputs } from "../../utils/api";
import { formatDate, objectId } from "../../utils/utilityFunctions";
import Link from "next/link";

const CommentModal = dynamic(() => import("../home/CommentModal"), {
  ssr: false,
});

interface TweetProps {
  tweet: RouterOutputs["tweet"]["getTweets"][number];
  userSession: Session;
  queryClient: QueryClient;
  dataKey: QueryKey;
}

export default function Tweet({
  tweet,
  userSession,
  queryClient,
  dataKey,
}: TweetProps) {
  const [toggleModal, setToggleModal] = useState<boolean>(false);

  // ! delete tweet mutation
  const { mutate: deleteTweet, isLoading: tweetDeleteLoading } = useDeleteTweet(
    { queryClient }
  );

  // ! like tweet mutation
  const { mutate: likeTweet } = useLikeTweet({
    queryClient,
    userID: userSession.user.id,
    dataKey,
  });

  // ! bookmark tweet mutation
  const { mutate: bookmarkTweet } = useBookmarkTweet({
    queryClient,
    userID: userSession.user.id,
    dataKey,
  });

  // ! retweet tweet mutation
  const { mutate: retweetTweet } = useRetweetTweet({
    queryClient,
    userID: userSession.user.id,
    name: userSession.user.name || null,
    dataKey,
  });

  // ! delete tweet function
  function tweetDelete() {
    deleteTweet({ tweetID: tweet.id, imageID: tweet.imageID ?? undefined });
  }

  // ! like tweet function
  function tweetLike() {
    likeTweet({
      likeID: tweet.likes[0]?.id,
      twitterID: tweet.id,
      newLikeID: tweet.likes[0]?.id ? "" : objectId(),
    });
  }

  // ! bookmark tweet function
  function tweetBookmark() {
    bookmarkTweet({
      bookmarkID: tweet.Bookmark[0]?.id,
      twitterID: tweet.id,
      newBookmarkID: tweet.Bookmark[0]?.id ? "" : objectId(),
    });
  }

  // ! retweet tweet function
  function tweetRetweet() {
    const userRetweetID = tweet.retweets.find(
      (r) => r.userId === userSession.user.id
    )?.id;

    retweetTweet({
      retweetID: userRetweetID,
      twitterID: tweet.id,
      newRetweetID: userRetweetID ? "" : objectId(),
    });
  }

  return (
    <li className="w-full">
      {tweet.retweets.length ? (
        <h2 className="mb-2 flex items-center gap-2.5 text-gray-400">
          <FaRetweet className="text-lg" />
          <span className="text-sm">
            {tweet.retweets
              .map((r) =>
                r.userId === userSession.user.id ? "You" : r.user.name
              )
              .join(", ")}{" "}
            Retweeted
          </span>
        </h2>
      ) : null}

      <article className="max-w-full">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/profile/${tweet.user.id}`}>
                <Avatar
                  img={
                    tweet.user.image ||
                    "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  }
                />
              </Link>
              <div>
                <Link href={`/profile/${tweet.user.id}`}>
                  <h3 className="text-base font-bold capitalize text-black">
                    {tweet.user.name}
                  </h3>
                </Link>
                <time
                  dateTime={tweet.createdAt as unknown as string}
                  className="text-xs font-medium text-gray-400"
                >
                  {formatDate(tweet.createdAt)}
                </time>
              </div>
            </div>

            {userSession?.user.id === tweet.user.id && (
              <Dropdown
                label={<BsThreeDots />}
                dismissOnClick={false}
                arrowIcon={false}
                inline={true}
                className={
                  tweetDeleteLoading
                    ? "pointer-events-none"
                    : "pointer-events-auto"
                }
              >
                <Dropdown.Item onClick={tweetDelete}>
                  {tweetDeleteLoading ? (
                    <Spinner aria-label="Default status example" />
                  ) : (
                    "Delete"
                  )}
                </Dropdown.Item>
              </Dropdown>
            )}
          </div>

          <p className="text-base font-medium text-gray-600">{tweet.text}</p>

          {tweet.image && (
            <figure className="relative h-60 w-full sm:h-80">
              <Image
                src={tweet.image}
                alt="tweet cover"
                className="object-contain"
                fill={true}
              />
            </figure>
          )}

          <div className="flex items-center justify-end space-x-4 border-0 border-b-2 border-solid border-gray-100 pb-1 text-xs font-medium text-gray-400">
            <span>{tweet._count.comments} Comments</span>
            <span>{tweet._count.retweets} Retweets</span>
            <span>{tweet._count.Bookmark} Saved</span>
            <span>{tweet._count.likes} Liked</span>
          </div>

          <Button.Group className="flex flex-wrap justify-between border-0 border-b-2 border-solid border-gray-100 pb-3">
            <Button
              color="gray"
              className="flex-1"
              onClick={() => setToggleModal(true)}
            >
              <FaRegCommentAlt className="mr-3 text-xl" />
              <span className="hidden sm:block">Comments</span>
            </Button>
            <Button
              onClick={tweetRetweet}
              color=""
              className={`flex-1 ${
                tweet.retweets.find((r) => r.userId === userSession.user.id)
                  ? "text-green-500"
                  : ""
              }`}
            >
              <FaRetweet className="mr-3 text-xl" />
              <span className="hidden sm:block">Retweet</span>
            </Button>
            <Button
              onClick={tweetLike}
              color=""
              className={`flex-1 ${
                tweet.likes.length === 1 ? "text-red-500" : ""
              }`}
            >
              <FaRegHeart className="mr-3 text-xl" />
              <span className="hidden sm:block">Like</span>
            </Button>
            <Button
              onClick={tweetBookmark}
              color=""
              className={`flex-1 ${
                tweet.Bookmark.length === 1 ? "text-blue-500" : ""
              }`}
            >
              <FaRegBookmark className="mr-3 text-xl" />
              <span className="hidden sm:block">Bookmark</span>
            </Button>
          </Button.Group>

          <CommentModal
            toggleModal={toggleModal}
            setToggleModal={setToggleModal}
            tweetID={tweet.id}
            queryClient={queryClient}
            userSession={userSession}
          />
        </Card>
      </article>
    </li>
  );
}
