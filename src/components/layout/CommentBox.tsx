import type { QueryClient } from "@tanstack/react-query";
import { Avatar, TextInput } from "flowbite-react";
import Image from "next/image";
import { useState, useRef } from "react";
import type { FormEvent } from "react";
import { BiImageAlt } from "react-icons/bi";
import useCreateComment from "../../hooks/comment/useCreateComment";
import type { Session } from "next-auth";

interface Props {
  queryClient: QueryClient;
  tweetID: string;
  userSession: Session;
}

export default function CommentBox({
  queryClient,
  tweetID,
  userSession,
}: Props) {
  // ! states
  const [text, setText] = useState<string>("");
  const [photo, setPhoto] = useState({ name: "", url: "" });

  // ! create comment mutation
  const { mutate, isLoading } = useCreateComment({
    queryClient,
    setText,
    setPhoto,
    tweetID,
  });

  // ! image input reference
  const photoFileRef = useRef<HTMLInputElement | null>(null);

  // ! get temporary image url
  function handleImageChange(file: File | undefined) {
    if (file === undefined) return;
    const reader = (readFile: File) =>
      new Promise<string>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.readAsDataURL(readFile);
      });

    reader(file)
      .then((result: string) => setPhoto({ name: file.name, url: result }))
      .catch((err) => console.log(err));
  }

  // ! create comment function
  function commentCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutate({ comment: text, image: photo.url, tweetID });
  }

  return (
    <>
      <form className="flex items-center gap-4" onSubmit={commentCreate}>
        <Avatar
          img={
            userSession.user.image
              ? userSession.user.image
              : "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
          }
          className="hidden sm:block"
        />
        <fieldset className="relative flex-1">
          <TextInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            type="text"
            placeholder="Tweet your reply"
            required={true}
            className="rounded-lg border border-solid border-gray-200"
          />
          <BiImageAlt
            onClick={() => photoFileRef.current?.click()}
            className="absolute top-2 right-2 cursor-pointer text-2xl text-gray-400 hover:text-blue-500"
          />
          <input
            type="file"
            ref={photoFileRef}
            className="hidden"
            onChange={(e) =>
              handleImageChange(e.target.files ? e.target.files[0] : undefined)
            }
          />
        </fieldset>
      </form>
      {photo.url && (
        <div className="relative mt-3 h-40 w-full">
          <Image
            src={photo.url}
            alt="comment cover"
            fill
            className="object-contain"
          />
        </div>
      )}
    </>
  );
}
