import { Alert, ListGroup, TextInput } from "flowbite-react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { BiSearch } from "react-icons/bi";
import LatestTab from "../components/explore/LatestTab";
import MediaTab from "../components/explore/MediaTab";
import PeopleTab from "../components/explore/PeopleTab";
import TopTab from "../components/explore/TopTab";
import useDebounce from "../hooks/useDebounce";

export default function Explore({
  userSession,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [currentTab, setCurrentTab] = useState<
    "TOP" | "LATEST" | "PEOPLE" | "MEDIA"
  >("TOP");

  const [srcValue, setSrcValue] = useState<string>("");
  const deferredSrcQuery = useDebounce(srcValue, 500);

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
            active={currentTab === "TOP"}
            onClick={() => setCurrentTab("TOP")}
          >
            Top
          </ListGroup.Item>
          <ListGroup.Item
            active={currentTab === "LATEST"}
            onClick={() => setCurrentTab("LATEST")}
          >
            Latest
          </ListGroup.Item>
          <ListGroup.Item
            active={currentTab === "PEOPLE"}
            onClick={() => setCurrentTab("PEOPLE")}
          >
            People
          </ListGroup.Item>
          <ListGroup.Item
            active={currentTab === "MEDIA"}
            onClick={() => setCurrentTab("MEDIA")}
          >
            Media
          </ListGroup.Item>
        </ListGroup>
      </div>

      <section className="md:col-span-3">
        <form
          className="relative rounded-lg bg-white"
          onSubmit={(e) => e.preventDefault()}
        >
          <TextInput
            type="text"
            placeholder="Search"
            value={srcValue}
            onChange={(e) => setSrcValue(e.target.value)}
            className="shadow-md shadow-gray-300"
          />
          <BiSearch className="absolute top-2 right-2 cursor-pointer text-2xl text-gray-400 hover:text-blue-500" />
        </form>

        {currentTab === "TOP" && (
          <TopTab userSession={userSession} srcQuery={deferredSrcQuery} />
        )}
        {currentTab === "LATEST" && (
          <LatestTab userSession={userSession} srcQuery={deferredSrcQuery} />
        )}
        {currentTab === "PEOPLE" && <PeopleTab srcQuery={deferredSrcQuery} />}
        {currentTab === "MEDIA" && (
          <MediaTab userSession={userSession} srcQuery={deferredSrcQuery} />
        )}
      </section>
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
