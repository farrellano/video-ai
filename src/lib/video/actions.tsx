"use server";

import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { azure } from "@ai-sdk/azure";
import { ReactNode } from "react";
import { z } from "zod";
import { generateId } from "ai";
import { BotMessage } from "@/components/message";
import { IdentifyImage } from "@/components/identifyImg";

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

const LoadingComponentPerson = () => (
  <div className="animate-pulse p-4">Person identify...</div>
);
export async function submitUserMessage(
  contentImage: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const result = await streamUI({
    model: azure("chat4o"),
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
                  5. Detecta los animales que estan en el entorno.\n
                  6. Detecta las figuras que estan en la imagen y proporciona de que serie son o pelicula.\n
                  7. Llama a la función personInEnviroment si identificas personas presentes en la imagen solo si estan en primer plano y describe su apariencia y acciones.\n
                  8. Formato utilizado markdown.\n
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
        textStream.done();
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools: {
      personInEnviroment: {
        description: "Detecta las personas en el entorno.",
        parameters: z.object({
          texto: z.string().describe("Describe su apariencia y acciones"),
        }),
        generate: async function* ({ texto }) {
          yield <LoadingComponentPerson />;
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: "assistant",
              content: "personInEnviroment",
            },
          ]);

          return (
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Description:
              </h1>
              <BotMessage content={texto} />
              <IdentifyImage content={contentImage} />
            </div>
          );
        },
      },
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage>({
  actions: {
    submitUserMessage,
  },
  initialAIState: [],
  initialUIState: {
    id: generateId(),
    role: "assistant",
    display: null,
  },
});
