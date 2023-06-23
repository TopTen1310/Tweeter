import type { QueryClient } from "@tanstack/react-query";
import { Avatar, Dropdown, Spinner } from "flowbite-react";
import type { Session } from "next-auth";
import Image from "next/image";
import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";
import useDeleteComment from "../../hooks/comment/useDeleteComment";
import useLikeComment from "../../hooks/comment/useLikeComment";
import type { RouterOutputs } from "../../utils/api";
import { formatDate, objectId } from "../../utils/utilityFunctions";

interface CommentProps {
  comment: RouterOutputs["comment"]["getComments"][number];
  userSession: Session;
  queryClient: QueryClient;
  tweetID: string;
}

export default function TweetComment({
  comment,
  userSession,
  queryClient,
  tweetID,
}: CommentProps) {
  // ! delete comment mutation
  const { mutate: deleteComment, isLoading: commentDeleteLoading } =
    useDeleteComment({ queryClient, tweetID });

  // ! like comment mutation
  const { mutate: likeComment } = useLikeComment({
    queryClient,
    userID: userSession.user.id,
    tweetID,
  });

  // ! delete comment function
  function commentDelete() {
    deleteComment({
      commentID: comment.id,
      imageID: comment.imageID ?? undefined,
    });
  }

  // ! like comment function
  function commentLike() {
    likeComment({
      likeID: comment.likes[0]?.id,
      commentID: comment.id,
      newLikeID: comment.likes[0]?.id ? "" : objectId(),
    });
  }

  return (
    <div className="mt-6 flex items-start gap-4">
      <Avatar
        img={
          comment.user.image
            ? comment.user.image
            : "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
        }
        className="hidden sm:block"
      />
      <div className="flex-1">
        <div className="rounded-lg bg-gray-100 p-3">
          <div className="flex justify-between">
            <h3 className="flex items-center gap-3 text-base font-bold capitalize text-black">
              <span>{comment.user.name}</span>
              <time
                dateTime={comment.createdAt.toString()}
                className="hidden text-xs font-medium text-gray-400 sm:block"
              >
                {formatDate(comment.createdAt)}
              </time>
            </h3>
            {userSession?.user.id === comment.user.id && (
              <Dropdown
                label={<BsThreeDots />}
                dismissOnClick={false}
                arrowIcon={false}
                inline={true}
                className={
                  commentDeleteLoading
                    ? "pointer-events-none"
                    : "pointer-events-auto"
                }
              >
                <Dropdown.Item onClick={commentDelete}>
                  {commentDeleteLoading ? (
                    <Spinner aria-label="Default status example" />
                  ) : (
                    "Delete"
                  )}
                </Dropdown.Item>
              </Dropdown>
            )}
          </div>
          <p className="text-base font-medium text-gray-700">{comment.text}</p>
          {comment.image && (
            <div className="relative mt-3 h-40 w-full">
              <Image
                src={comment.image}
                alt="comment cover"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center space-x-4 border-gray-100 text-xs font-medium text-gray-400">
          <span
            onClick={commentLike}
            className={`flex cursor-pointer items-center text-sm font-medium ${
              comment.likes.length === 1 ? "text-red-500" : "text-gray-400"
            } hover:text-red-500`}
          >
            <FaRegHeart className="mr-1.5 text-base" /> Like
          </span>
          <span className="text-gray-40 text-sm font-medium">
            {comment._count.likes} Likes
          </span>
        </div>
      </div>
    </div>
  );
}
