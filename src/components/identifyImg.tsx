import Image from "next/image";
import { compareVectors } from "@/lib/image/actions";
import EmblaCarousel from "./showImg";
import Results from "./results";

interface identifyImgProps {
  content: string;
}

export async function IdentifyImage({ content }: identifyImgProps) {
  const result = await compareVectors({ content });

  return (
    <div className="flex flex-col mt-4">
      <p className="text-2xl font-bold text-card-foreground border-b italic">
        Que tanto te pareces al Midu 🤔??
      </p>
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="flex-1 h-full flex flex-col items-center justify-center">
          <div className="relative w-full h-full">
            <Image src={content} alt="image" width={400} height={400} />
            <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
              Accuracy: {result.winner}
            </div>
          </div>
        </div>

        <div className="flex-1 h-full flex flex-col items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={result.imageWinner}
              alt="image"
              width={400}
              height={400}
            />
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
              win ✌️
            </div>
          </div>
        </div>
      </div>
      <Results {...result} />
      <p className="mb-4">Otros resultados:</p>
      <EmblaCarousel {...result} />
    </div>
  );
}
