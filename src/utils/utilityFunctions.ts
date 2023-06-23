import type { TRPCError } from "@trpc/server";

export function formatDate(myDate: Date) {
  const date = new Date(myDate);
  const options: { month: "long"; year: "numeric"; day: "numeric" } = {
    month: "long",
    year: "numeric",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export function formatError(err: any) {
  const formattedError: TRPCError = {
    name: "TRPCError",
    code: "INTERNAL_SERVER_ERROR",
    message:
      (err.response && err.response.data && err.response.data.message) ||
      err.message ||
      err.toString(),
    cause: err,
  };
  return formattedError;
}

export function objectId() {
  return (
    hex(Date.now() / 1000) +
    " ".repeat(16).replace(/./g, () => hex(Math.random() * 16))
  );
}

function hex(value: number) {
  return Math.floor(value).toString(16);
}

// ! strict rule
// $and: [
//   {
//     $in: [
//       { $toString: "$$n.userId" },
//       following,
//     ],
//   },
//   { $ne: ["$$n.userId", "$$tweetUser._id"] },
// ],
// {
//   $lookup: {
//     from: "User",
//     localField: "retweets.userId",
//     foreignField: "_id",
//     as: "retweeters",
//   },
// },
