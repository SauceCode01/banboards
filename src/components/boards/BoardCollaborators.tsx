"use client";

import { useAuthContext } from "@/Providers/AuthProvider";
import { supabase } from "@/lib/supabase/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";

type PresenceState = {
  username: string;
  email: string;
  avatar_url: string | null;
};

type Collaborator = {
  id: string;
} & PresenceState;

export default function BoardCollaborators() {
  const { boardId } = useParams();
  const { userProfile } = useAuthContext();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userProfile || !boardId) return;

    const channel = supabase.channel(`board-presence-${boardId}`, {
      config: {
        presence: {
          key: userProfile.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<PresenceState>();
        const newCollaborators: Collaborator[] = Object.entries(presenceState)
          .map(([id, presences]) => ({
            id,
            ...presences[0],
          }));
        setCollaborators(newCollaborators);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            username: userProfile.username,
            email: userProfile.email,
            avatar_url: userProfile.avatar_url,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userProfile, boardId]);

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center -space-x-2">
      {collaborators.map((collaborator) => (
        <div key={collaborator.id}>
          <a
            data-tooltip-id={`tooltip-${collaborator.id}`}
            data-tooltip-content={`${collaborator.username} (${collaborator.email})`}
          >
            {collaborator.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={collaborator.avatar_url}
                alt={collaborator.username}
                className="h-10 w-10 rounded-full object-cover border-2 border-slate-900"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border-2 border-slate-900">
                {collaborator.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </a>
          <Tooltip id={`tooltip-${collaborator.id}`} />
        </div>
      ))}
    </div>
  );
}
