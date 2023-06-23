import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Card, Spinner } from "flowbite-react";
import type { RouterOutputs } from "../../utils/api";
import FollowUser from "./FollowUser";

interface Props {
  suggestToFollow: RouterOutputs["follow"]["suggestToFollow"] | undefined;
}

export default function ToFollow({ suggestToFollow }: Props) {
  const [parent] = useAutoAnimate();

  return (
    <div className="styledScrollbar max-h-[435.6px] w-full">
      <Card>
        <div className="flex items-center justify-between border-0 border-b-2 border-solid border-gray-200 pb-1.5">
          <h4 className="text-sm font-semibold text-black">Who to follow</h4>
        </div>

        <div className="flow-root">
          <ul
            ref={parent}
            className="divide-y divide-gray-200 dark:divide-gray-700"
          >
            {suggestToFollow ? (
              suggestToFollow.map((s) => (
                <FollowUser key={s.id} suggestedUser={s} />
              ))
            ) : (
              <div className="text-center">
                <Spinner aria-label="Default status example" size="md" />
              </div>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}
