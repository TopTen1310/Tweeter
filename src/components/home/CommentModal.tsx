import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { QueryClient } from "@tanstack/react-query";
import { Alert, Modal, Spinner } from "flowbite-react";
import type { Session } from "next-auth";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";
import CommentBox from "../layout/CommentBox";
import TweetComment from "../layout/TweetComment";

interface CommentModalProps {
  toggleModal: boolean;
  setToggleModal: Dispatch<SetStateAction<boolean>>;
  tweetID: string;
  queryClient: QueryClient;
  userSession: Session;
}

const CommentModal = ({
  toggleModal,
  setToggleModal,
  tweetID,
  queryClient,
  userSession,
}: CommentModalProps) => {
  // ! get comments query
  const { data: allComments, isLoading } = api.comment.getComments.useQuery(
    tweetID,
    {
      onError: (err) => {
        console.log(err);
        toast.error("Server error. Please try again later😓");
      },
    }
  );

  const [parent] = useAutoAnimate();

  return (
    <Modal
      dismissible={true}
      show={toggleModal}
      size="3xl"
      onClose={() => setToggleModal(false)}
    >
      <Modal.Header className="border-0 border-b-2 border-solid border-gray-300">
        Comments
      </Modal.Header>

      <Modal.Body className="styledScrollbar max-h-[600px]">
        <CommentBox
          userSession={userSession}
          queryClient={queryClient}
          tweetID={tweetID}
        />

        {isLoading ? (
          <div className="mt-6 flex items-center">
            <Spinner size="lg" aria-label="Default status example" />
          </div>
        ) : allComments === undefined || allComments.length === 0 ? (
          <Alert color="info" className="mt-6">
            <span>
              <span className="font-medium">No comments!</span> No comments to
              show!!!.
            </span>
          </Alert>
        ) : (
          <ul ref={parent}>
            {allComments.map((c) => (
              <TweetComment
                key={c.id}
                comment={c}
                userSession={userSession}
                queryClient={queryClient}
                tweetID={tweetID}
              />
            ))}
          </ul>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CommentModal;
