// @ts-nocheck
"use client";

import { useGetCall } from "@/hooks/user-get-call";
import type { CallRecording } from "@stream-io/node-sdk";
import type { Call } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const { endedCall, upComingCalls, callRecordings, isLoading } = useGetCall();
  const router = useRouter();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCall;
      case "recordings":
        return recordings;
      case "upcoming":
        return upComingCalls;
      default:
        return [];
    }
  };
  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "recordings":
        return "No Recording";
      case "upcoming":
        return "No Upcoming Calls";
      default:
        return "";
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchRecording = async () => {
      const callData = await Promise.all(callRecordings.map((meeting) => meeting.queryRecordings()))
      const recordings = callData.filter((call) => call.recordings.length > 0).flatMap((call) => call.recordings)
      setRecordings(recordings)
    }
    if(type === recordings)  fetchRecording();
  }, [type, callRecordings])

  const calls = getCalls();
  const getNoCalls = getNoCallsMessage();

  if (isLoading) return <Loader />;

  return (
    <div className="grid  grid-col-1 gap-5 xl:grid-col-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call).id}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              (meeting as Call)?.state?.custom?.description.substring(0, 21) ||
              "No Description"
            }
            date={
              (meeting as Call)?.state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            handleClick={
              type === "recordings"
                ? () => {
                    router.push(`${meeting.url}`);
                  }
                : () => {
                    router.push(`/meeting/${meeting.id}`);
                  }
            }
            link={
              type === "recordings"
                ? meeting?.url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting?.id}`
            }
            buttonText={type === "recordings" ? "Play" : "Start"}
          />
        ))
      ) : (
        <h1>{getNoCalls}</h1>
      )}
    </div>
  );
};

export default CallList;
