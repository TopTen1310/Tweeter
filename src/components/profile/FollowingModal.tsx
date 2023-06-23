import { Alert, Modal, Spinner } from "flowbite-react";
import ModalItem from "./ModalItem";
import type { Dispatch, SetStateAction } from "react";
import { api } from "../../utils/api";
import { toast } from "react-hot-toast";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Session } from "next-auth";

interface FollowingModalProps {
  toggleModal: boolean;
  setToggleModal: Dispatch<SetStateAction<boolean>>;
  userID: string;
  name: string | null;
  userSession: Session;
}

const FollowingModal = ({
  toggleModal,
  setToggleModal,
  userID,
  name,
  userSession,
}: FollowingModalProps) => {
  const { data, isLoading } = api.follow.getFollowing.useQuery(
    { userID },
    {
      onError: (err) => {
        console.log(err);
        toast.error("Server error. Please try again later😓");
      },
      refetchOnMount: true,
    }
  );

  const [parent] = useAutoAnimate();

  return (
    <Modal
      dismissible={true}
      show={toggleModal}
      onClose={() => setToggleModal(false)}
    >
      <Modal.Header className="border-0 border-b-2 border-solid border-gray-300">
        {userSession.user.id === userID ? "You are" : name ? `${name} is` : ""}{" "}
        following
      </Modal.Header>

      <ul ref={parent} className="styledScrollbar max-h-[548px] px-5">
        {isLoading ? (
          <div className="mt-6 flex justify-center">
            <Spinner size="lg" aria-label="Default status example" />
          </div>
        ) : data === undefined || !data.length ? (
          <Alert color="info" className="my-4">
            <span>
              <span className="font-medium">No users!</span>{" "}
              {userSession.user.id === userID
                ? "You are "
                : name
                ? `${name} is `
                : ""}
              not following anyone yet!!!.
            </span>
          </Alert>
        ) : (
          data.map((u) => (
            <ModalItem
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
};

export default FollowingModal;
