import Image from "next/image";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const Canvas = dynamic(() => import("@/components/Canvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <head>
        <title>My First 2D Shooting Game</title>
      </head>
      <Canvas />
    </>
  );
}
