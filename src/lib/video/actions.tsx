"use server";

import { ReactNode } from "react";
import {
  createAI,
  streamUI,
  createStreamableValue,
  getMutableAIState,
} from "ai/rsc";
import { azure } from "@ai-sdk/azure";
import { nanoid } from "nanoid";
import { BotMessage, SpinnerMessage } from "@/components/message";
import { z } from "zod";
import { IdentifyImage } from "@/components/identifyImg";

export async function submitUserMessage(
  contentImage: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const result = await streamUI({
    model: azure("chat4o"),
    initial: <SpinnerMessage />,
    messages: [
      ...history.get(),
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `\
                  Tú eres un experto en el análisis de contenidos visuales. Por favor, analiza la imagen proporcionada en busca de los siguientes detalles:\n
                  1. Identifica cualquier texto presente en la imagen y proporcione un resumen.\n
                  2. Describe los objetos principales y su disposición.\n
                  3. Identifica el contexto del fotograma de vídeo (por ejemplo, entorno de trabajo, escena exterior).\n
                  4. Indica cualquier observación destacable sobre la iluminación, los colores y la composición general.
                  5. Si detectas personas que estan en el entorno llama a la funcion personInEnviroment.\n
                  6. Detecta los animales que estan en el entorno.\n
                  7. Formato utilizado markdown.\n
                  Aquí tienes el fotograma de vídeo: Analiza esta imagen`,
          },
          {
            type: "image",
            image: contentImage,
          },
        ],
      },
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue("");
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
        textStream.done();
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools: {
      personInEnviroment: {
        description: "Detecta las personas en el entorno.",
        parameters: z.object({
          texto: z.string().describe("Descripcion de la persona"),
        }),
        generate: async function* ({ texto }) {
          return (
            <div>
              {texto}{" "}
              <>
                <IdentifyImage content={contentImage} />
              </>
            </div>
          );
        },
      },
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    submitUserMessage,
  },
  initialAIState: [],
  initialUIState: [],
});
