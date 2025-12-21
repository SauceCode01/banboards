"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";

type Reply = Tables<"reply">;
type CommentWithReplies = Tables<"comment"> & { reply: Reply[] };
type PostWithComments = Tables<"post"> & { comment: CommentWithReplies[] };

const Comment = ({ comment }: { comment: CommentWithReplies }) => {
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState<Reply[]>(comment.reply || []);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyOnlyForm, setShowReplyOnlyForm] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    const setupChannel = async () => {
      await supabase.realtime.setAuth();
      channel = supabase
        .channel(`post:comment:reply:${comment.id}`, {
          config: { private: true },
        })
        .on(
          "broadcast",
          {
            event: "INSERT",
          },
          (payload) => {
            console.log(payload);
            const record = payload.payload.record as Reply;
            console.log(record);
            setReplies((currentReplies) => {
              if (!currentReplies.find((r) => r.id === record.id)) {
                return [...currentReplies, record];
              }
              return currentReplies;
            });
          }
        )
        .subscribe((status, error) => {
          if (error) {
            console.error("comment error", error, comment.id);
          } else {
            console.log("comment status", status, comment.id);
            console.log(status);
          }
        });
    };

    setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [comment.id]);

  const handleAddReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Please login to add a reply");
      return;
    }

    const user = session.user;

    // We don't need to ".select()" and update state here.
    // The realtime subscription will handle it.
    await supabase
      .from("reply")
      .insert([{ content: reply, comment_id: comment.id, user_id: user.id }]);

    setReply("");
    setShowReplyOnlyForm(false);
  };

  const hasReplies = replies.length > 0;

  return (
    <div className="p-2 mt-2 rounded-lg bg-gray-300">
      <p>{comment.content}</p>
      <p className="text-xs text-gray-500">{comment.created_at}</p>

      {hasReplies ? (
        <>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-blue-500 mt-2"
          >
            {showReplies ? "Hide" : `Show ${replies.length}`} replies
          </button>
          {showReplies && (
            <div className="ml-4 mt-2">
              {replies.map((reply) => (
                <div key={reply.id} className="p-2 mt-2 rounded-lg bg-gray-400">
                  <p>{reply.content}</p>
                  <p className="text-xs text-gray-500">{reply.created_at}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setShowReplyOnlyForm(!showReplyOnlyForm)}
          className="text-xs text-blue-500 mt-2"
        >
          {showReplyOnlyForm ? "Cancel" : "Reply"}
        </button>
      )}

      {(showReplies || showReplyOnlyForm) && (
        <form onSubmit={handleAddReply} className="mt-2 ml-4">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add a reply..."
            className="w-full p-1 rounded-lg border"
          />
          <button
            type="submit"
            className="mt-1 px-2 py-1 rounded-lg bg-blue-400 text-white"
          >
            Add Reply
          </button>
        </form>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: PostWithComments }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentWithReplies[]>(
    post.comment || []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    const setupChannel = async () => {
      await supabase.realtime.setAuth(); // Needed for Realtime Authorization
      channel = supabase
        .channel(`post:comment:${post.id}`, {
          config: { private: true },
        })
        .on("broadcast", { event: "INSERT" }, (payload) => {
          console.log(payload);
          const record = payload.payload.record as CommentWithReplies;
          setComments((currentComments) => {
            if (!currentComments.find((c) => c.id === record.id)) {
              console.log("New comment: ", record);
              return [...currentComments, record];
            }
            console.log("Comment already exists: ", record);
            return currentComments;
          });
        })
        .subscribe((status, error) => {
          if (error) {
            console.error(error);
          } else {
            console.log(status);
          }
        });
    };

    setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Please login to add a comment");
      return;
    }

    const user = session.user;

    // We don't need to ".select()" and update state here.
    // The realtime subscription will handle it.
    const { error } = await supabase
      .from("comment")
      .insert([{ content: comment, post_id: post.id, user_id: user.id }]);

    if (error) {
      setError(error.message);
    } else {
      setComment("");
      setError(null);
    }
  };

  return (
    <div key={post.id} className="m-4 p-4 rounded-2xl bg-gray-200 shadow-md">
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</div>
      )}
      <h1 className="font-bold text-lg">{post.content}</h1>
      <p>{post.is_published ? "Published" : "Not Published"}</p>
      <p>{post.created_at}</p>
      <p>{post.user_id}</p>

      <div className="mt-4">
        <h2 className="font-bold">Comments</h2>
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>

      <form onSubmit={handleAddComment} className="mt-4">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 rounded-lg border"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 rounded-lg bg-blue-500 text-white"
        >
          Add Comment
        </button>
      </form>
    </div>
  );
};

export default PostCard;
