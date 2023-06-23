import { Spinner } from "flowbite-react";
import { useState } from "react";
import { api } from "../../utils/api";

export default function Trends() {
  const { data, isError, error } = api.news.getNews.useQuery();
  const [newsLimit, setNewsLimit] = useState<number>(5);

  if (isError) {
    console.log(error);
  }

  return (
    <ul className="w-full space-y-3 bg-white py-2.5">
      <h4 className="mx-2 border-0 border-b-2 border-solid border-gray-200 pb-1 text-sm font-semibold text-black">
        News for you
      </h4>
      {data ? (
        data.articles.slice(0, newsLimit).map((a, i) => (
          <li key={i} className="flex gap-2 px-4">
            <article className="">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm font-semibold leading-5 text-black hover:underline"
              >
                {a.description?.slice(0, 50)}...
              </a>
              <p className="mt-0.5 text-xs font-medium text-gray-400">
                {a.source.name}
              </p>
            </article>
            <img
              src={a.urlToImage}
              alt="news"
              className="h-14 w-16 min-w-[4rem] object-cover"
            />
          </li>
        ))
      ) : (
        <div className="text-center">
          <Spinner aria-label="Default status example" size="lg" />
        </div>
      )}
      <span
        onClick={() => setNewsLimit((prev) => prev + 5)}
        className={`cursor-pointer px-4 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-500 ${
          newsLimit >= 20 || !data ? "hidden" : "block"
        }`}
      >
        View more
      </span>
    </ul>
  );
}
