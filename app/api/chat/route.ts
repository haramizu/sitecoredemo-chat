import OpenAI from "openai";
import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from "ai";
import { functions, runFunction } from "./functions";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastIndex = messages.length - 1;

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages,
    functions,
  });

  const data = new experimental_StreamData();

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages
    ) => {
      const result = await runFunction(name, args);
      if (result) {
        const newMessages = createFunctionCallMessages(result);

        data.append({
          type: name,
          sources: result,
          index: lastIndex + 1,
        });

        return openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          stream: true,
          messages: [...messages, ...newMessages],
          functions,
        });
      }
    },
    onFinal(completion) {
      data.close();
    },
    experimental_streamData: true,
  });
  // Respond with the stream
  return new StreamingTextResponse(stream, {}, data);
}
