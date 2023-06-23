import type { Session } from "next-auth";
import type { Dispatch, SetStateAction } from "react";
import { api } from "../../utils/api";
import { toast } from "react-hot-toast";
import { Alert, Modal, Spinner } from "flowbite-react";
import FollowedModalItem from "./FollowedModalItem";

interface FollowedModalProps {
  toggleModal: boolean;
  setToggleModal: Dispatch<SetStateAction<boolean>>;
  userID: string;
  name: string | null;
  userSession: Session;
}

export default function FollowedModal({
  toggleModal,
  setToggleModal,
  userID,
  name,
  userSession,
}: FollowedModalProps) {
  const { data, isLoading } = api.follow.getFollowedBy.useQuery(
    { userID },
    {
      onError: (err) => {
        console.log(err);
        toast.error("Server error. Please try again later😓");
      },
      refetchOnMount: true,
    }
  );
  return (
    <Modal
      dismissible={true}
      show={toggleModal}
      onClose={() => setToggleModal(false)}
    >
      <Modal.Header className="border-0 border-b-2 border-solid border-gray-300">
        {userSession.user.id === userID ? "You are" : name ? `${name} is` : ""}{" "}
        followed by
      </Modal.Header>

      <ul className="styledScrollbar max-h-[548px] px-5">
        {isLoading ? (
          <div className="mt-6 flex justify-center">
            <Spinner size="lg" aria-label="Default status example" />
          </div>
        ) : data === undefined || !data.length ? (
          <Alert color="info" className="my-4">
            <span>
              <span className="font-medium">No users!</span>{" "}
              {userSession.user.id === userID
                ? "You don't "
                : name
                ? `${name} doesn't `
                : ""}
              have any followers yet!!!.
            </span>
          </Alert>
        ) : (
          data.map((u) => (
            <FollowedModalItem
              key={u.id}
              user={u}
              userSession={userSession}
              profileUserId={userID}
            />
          ))
        )}
      </ul>
    </Modal>
  );
}
