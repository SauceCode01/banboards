"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import { Database, Tables, TablesInsert } from "@/types/database.types";
import { toast } from "react-toastify";
import { useAuthContext } from "@/Providers/AuthProvider";

export default function NewWorkspaceForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { userProfile, session } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!session) {
        throw new Error("You must be logged in to create a workspace.");
      }

      console.log("posting ")

      const data: TablesInsert<"workspace"> = {
        title,
        owner_id: session.user.id,
      };

      console.log("data", data)

      const { error: insertError } = await supabase
        .from("workspace")
        .insert([data]);

      console.log("insertError", insertError)

      if (insertError) {
        throw insertError;
      }

      console.log("WorkSpace created successfully!");
      // Reset form
      setTitle("");

      toast.success("WorkSpace created successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New workspace</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-md"
      >
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-400 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  "
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}
