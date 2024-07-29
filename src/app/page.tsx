"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useActions, useUIState } from "ai/rsc";
import { type AI } from "../lib/video/actions";
import { compareVectors } from "@/lib/image/actions";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };
  let intervalId = useRef<ReturnType<typeof setInterval> | null>();
  const [conversation, setConversation] = useUIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();

  const webcamRef = useRef(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const response = await submitUserMessage(imageSrc);

    setMessages((currentMessages) => [...currentMessages, response]);

    console.log("start video capture");
  }, [webcamRef, submitUserMessage, setMessages]);

  const captureframe = () => {
    if (processing) {
      return; // Terminate if processing is in progress or capture is already running
    }

    setProcessing(true);
    capture();
    //intervalId.current = setInterval(capture, 2 * 1000);
  };

  const stopCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot({
      width: 640,
      height: 480,
    });
    compareVectors({ content: imageSrc });

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary to-primary-foreground">
      <section className="container px-4 md:px-6 py-2 md:py-8 lg:py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary-foreground">
            Discover the Future of Video
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80">
            Immerse yourself in our latest video production and experience the
            cutting-edge of video technology.
          </p>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mr-2"
          >
            🛑 Stop
          </button>
        </div>
      </div>

      <section className="container px-4 md:px-6 py-2 md:py-8 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div key={index}>{message.display}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
