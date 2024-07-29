"use server";
import { image1, image2, image3, image4 } from "@/assets/images";
import { cosineSimilarity } from "ai";
import { ImageCompareWinner, ImagesCompares } from "../types";

interface ImageBase64 {
  content: string;
}

interface ImageVectorRequest {
  vector: number[];
  modelVersion: string;
}

//Azure AI Vision credentials
const vision_endpoint = process.env.VISION_API || "";
const vision_key = process.env.VISION_API_KEY || "";
const vision_api_version =
  "?api-version=2023-02-01-preview&modelVersion=latest";
const vectorize_img_url =
  vision_endpoint + "retrieval:vectorizeImage" + vision_api_version;

const headers = {
  "Content-type": "application/octet-stream",
  "Ocp-Apim-Subscription-Key": vision_key,
};

export async function compareVectors({ content }: ImageBase64) {
  const requestVector = await requestImageVectors({ content });
  const similarityImage: ImagesCompares[] = [];

  for (const image of [image1, image2, image3, image4]) {
    const requestVectorImages = await requestImageVectors({ content: image });
    similarityImage.push({
      similarity: cosineSimilarity(
        requestVector.vector,
        requestVectorImages.vector
      ),
      content: image,
    });
  }
  const win = Math.max(...similarityImage.map((image) => image.similarity));
  const winner: ImageCompareWinner = {
    content: similarityImage,
    winner: win,
    imageWinner:
      similarityImage.find((winner) => winner.similarity === win)?.content ||
      "",
  };
  return winner;
}

async function requestImageVectors({
  content,
}: ImageBase64): Promise<ImageVectorRequest> {
  const blobImage = await convert(content);
  const response = await fetch(vectorize_img_url, {
    method: "POST",
    headers: headers,
    body: blobImage,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));

  return response;
}

async function convert(params: string) {
  return await fetch(params).then((res) => res.blob());
}

function getFileFromBase64(string64: string, fileName: string) {
  const base64 = string64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const imageContent = atob(base64);
  const buffer = new ArrayBuffer(imageContent.length);
  const view = new Uint8Array(buffer);

  for (let n = 0; n < imageContent.length; n++) {
    view[n] = imageContent.charCodeAt(n);
  }
  const type = "image/jpeg";
  const blob = new Blob([buffer], { type });

  return blob;
}
