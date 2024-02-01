import { ChatCompletionCreateParams } from "openai/resources/chat";

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "get_top_stories":
      return await get_top_stories();
    case "get_story":
      return await get_story(args["id"]);
    default:
      return null;
  }
}

export const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "get_top_stories",
    description:
      "Get the top stories from News. Also returns the News URL to each story.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "The number of stories to return. Defaults to 10.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_story",
    description:
      "Get a story from News. Also returns the News URL to the story.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The ID of the story",
        },
      },
      required: ["id"],
    },
  },
];

async function get_top_stories(limit: number = 10) {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const ids = await response.json();
  const stories = await Promise.all(
    ids.slice(0, limit).map((id: number) => get_story(id))
  );

  console.log(stories);
  return stories;
}

async function get_story(id: number) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`
  );
  const data = await response.json();
  return {
    ...data,
    hnUrl: `https://news.ycombinator.com/item?id=${id}`,
  };
}
