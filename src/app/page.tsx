import VideoAI from "@/components/videoAI";

export const metadata = {
  title: "Video AI",
  description: "Discover the Future of Video",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary to-primary-foreground">
      <VideoAI />
    </div>
  );
}
