import Image from "next/image";
import { compareVectors } from "@/lib/image/actions";

interface identifyImgProps {
  content: string;
}

export async function IdentifyImage({ content }: identifyImgProps) {
  const result = await compareVectors({ content });

  return (
    <div className="flex flex-col">
      <Image src={content} alt="image" width={200} height={200} />
      <Image src={result.imageWinner} alt="image" width={200} height={200} />
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
