import { Alert, ListGroup } from "flowbite-react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";
import BookmarkLikeTab from "../components/bookmark/BookmarkLikeTab";
import BookmarkMediaTab from "../components/bookmark/BookmarkMediaTab";
import BookmarkTweetTab from "../components/bookmark/BookmarkTweetTab";

export default function Bookmarks({
  userSession,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [currentTab, setCurrentTab] = useState<"TWEETS" | "MEDIA" | "LIKES">(
    "TWEETS"
  );

  if (!userSession) {
    return (
      <Alert color="failure">
        <span>
          <span className="font-medium">Please Login first!</span>
        </span>
      </Alert>
    );
  }

  return (
    <main className="mx-auto grid w-[80rem] max-w-full grid-cols-1 gap-6 py-6 px-4 md:grid-cols-4">
      <div className="col-span-1 w-full">
        <ListGroup>
          <ListGroup.Item
            active={currentTab === "TWEETS"}
            onClick={() => setCurrentTab("TWEETS")}
          >
            Tweets
          </ListGroup.Item>
          <ListGroup.Item
            active={currentTab === "MEDIA"}
            onClick={() => setCurrentTab("MEDIA")}
          >
            Media
          </ListGroup.Item>
          <ListGroup.Item
            active={currentTab === "LIKES"}
            onClick={() => setCurrentTab("LIKES")}
          >
            Likes
          </ListGroup.Item>
        </ListGroup>
      </div>

      {currentTab === "TWEETS" && (
        <BookmarkTweetTab userSession={userSession} />
      )}
      {currentTab === "LIKES" && <BookmarkLikeTab userSession={userSession} />}
      {currentTab === "MEDIA" && <BookmarkMediaTab userSession={userSession} />}
    </main>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userSession = await getSession(context);

  return {
    props: {
      userSession,
    },
  };
}
