"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useActions, useUIState } from "ai/rsc";
import { type AI } from "../lib/video/actions";
import { nanoid } from "nanoid";

export const maxDuration = 30;

const LoadingComponent = () => (
  <div className="animate-pulse p-4">Processing image...</div>
);

const VerifyComponent = () => (
  <div className="animate-pulse p-4">Please check permissions of camera </div>
);

export default function VideoAI() {
  const [processing, setProcessing] = useState(false);
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };
  let intervalId = useRef<ReturnType<typeof setInterval> | null>();

  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();

  const webcamRef = useRef(null);

  // const capture = useCallback(async () => {

  //    console.log("start video capture");
  //  }, [webcamRef, submitUserMessage, setMessages]);

  const captureframe = async () => {
    // if (processing) {
    //   return;
    // }

    //@ts-ignore
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      console.log("Verifique los permisos de la camara");
      setMessages({
        id: nanoid(),
        role: "assistant",
        display: <VerifyComponent />,
      });

      return;
    }
    setMessages({
      id: nanoid(),
      role: "assistant",
      display: <LoadingComponent />,
    });
    const response = await submitUserMessage(imageSrc);

    setMessages(response);

    // setProcessing(true);
    //capture();
    //intervalId.current = setInterval(capture, 2 * 1000);
  };

  const stopCapture = () => {
    if (processing) {
      console.log("stopCapture");
      setProcessing(false);
      clearInterval(intervalId.current || 0);
      intervalId.current = null;
    } else {
      console.log("not processing");
    }
  };

  return (
    <>
      <section className="container px-4 md:px-6 py-2 md:py-8 lg:py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary-foreground">
            Discover the Future of Video
          </h1>
        </div>
      </section>
      <div className="container px-4 md:px-6  flex justify-center">
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden">
          <Webcam
            ref={webcamRef}
            className="w-full h-full object-cover"
            videoConstraints={videoConstraints}
            screenshotFormat="image/png"
            mirrored={true}
          />
        </div>
      </div>
      <div className="container px-4 md:px-6  flex justify-center">
        <div className="w-full p-2 text-center justify-center rounded-lg overflow-hidden">
          <button
            onClick={captureframe}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mr-2"
          >
            📸 Start
          </button>
          <button
            onClick={stopCapture}
            disabled={true}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mr-2 disabled:opacity-50"
          >
            🛑 Stop
          </button>
        </div>
      </div>

      <section className="container px-4 md:px-6 py-2 md:py-8 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <div>{messages.display}</div>
        </div>
      </section>
    </>
  );
}
