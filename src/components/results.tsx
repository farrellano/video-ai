import { ImageCompareWinner } from "@/lib/types";
import Image from "next/image";

export default function Results({ winner }: ImageCompareWinner) {
  if (
    Math.round(winner * 100) / 100 > 0.6 &&
    Math.round(winner * 100) / 100 < 0.8
  )
    return (
      <div className="flex flex-col mt-4 mb-4">
        <p className="text-2xl font-bold text-card-foreground">
          Hay un parecido a lo lejos 🤔
        </p>
      </div>
    );

  if (
    Math.round(winner * 100) / 100 >= 0.8 &&
    Math.round(winner * 100) / 100 <= 0.9
  )
    return (
      <div className="flex flex-col mt-4 mb-4">
        <p className="text-2xl font-bold text-card-foreground">
          Hay un gran parecido 😉
        </p>
      </div>
    );

  if (Math.round(winner * 100) / 100 > 0.9)
    return (
      <div className="flex flex-col mt-4 mb-4">
        <p className="text-2xl font-bold text-card-foreground">
          MiduDev eres tu?? 🤗
        </p>
        <Image
          src={
            "https://m.supergeek.cl/noticias/site/artic/20230608/imag/foto_0000000220230608102255/spider-verse.jpg"
          }
          alt="image"
          width={400}
          height={400}
        />
      </div>
    );
  return (
    <div className="flex flex-col mt-4 mb-4">
      <p className="text-2xl font-bold text-card-foreground">
        Nada de parecido
      </p>
    </div>
  );
}
