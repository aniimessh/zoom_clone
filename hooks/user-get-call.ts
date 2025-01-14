import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export const useGetCall = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const client = useStreamVideoClient();

  const { user } = useUser();

  useEffect(() => {
    const loadCall = async () => {
      if (!client || !user?.id) return;

      setIsLoading(true);
      try {
        const { calls } = await client.queryCalls({
          sort: [
            {
              field: "starts_at",
              direction: -1,
            },
          ],
          filter_conditions: {
            starts_at: { $exists: true },
            $or: [
              {
                created_by_user_id: user.id,
              },
              {
                members: { $in: [user.id] },
              },
            ],
          },
        });
        setCalls(calls);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCall();
  }, [client, user?.id]);

  const now = new Date();

  const endedCall = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  });
  const upComingCalls = calls?.filter(
    ({ state: { startsAt } }: Call) => {
      return startsAt && new Date(startsAt) > now;
    }
  );
  return {
    endedCall,
    upComingCalls,
    callRecordings: calls,
    isLoading,
  };
};
