import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Alert, Spinner } from "flowbite-react";
import { api } from "../../utils/api";
import Person from "./Person";

interface Props {
  srcQuery: string;
}

export default function PeopleTab({ srcQuery }: Props) {
  const [parent] = useAutoAnimate();

  const { data, isLoading } = api.explore.topUsers.useQuery(
    { srcQuery },
    {
      refetchOnMount: true,
    }
  );

  return (
    <div className="space-y-7 py-4 md:col-span-3">
      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <Spinner size="lg" aria-label="Default status example" />
        </div>
      ) : data && data.length ? (
        <ul
          ref={parent}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {data.map((p) => (
            <Person key={p.id} user={p} />
          ))}
        </ul>
      ) : (
        <Alert color="info">
          <span>
            <span className="font-medium">No users found!</span>
          </span>
        </Alert>
      )}
    </div>
  );
}
