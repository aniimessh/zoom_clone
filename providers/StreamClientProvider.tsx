"use client"

import { tokenProvider } from "@/actions/stream.action";
import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import {
  StreamVideo,
  StreamVideoClient,
  type User,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export const StreamVideoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!apiKey) throw new Error("Stream API key missing");
    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user?.id,
        name: user?.username || user?.id,
        image: user?.imageUrl,
      },
      tokenProvider: async () => {
        const token = await tokenProvider();
        if (!token) throw new Error("No token provided");
        return token;
      },
    });
    setVideoClient(client);
  }, [user, isLoaded]);
  if (!videoClient) {
    return <Loader />;
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};
