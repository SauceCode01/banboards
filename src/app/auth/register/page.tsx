"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const success = async () => {
    toast.success(
      "Registration successful! Please check your email to confirm your account."
    );
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      console.log("error");
    } else {
      console.log("success"); 
      success();
      // redirect to login
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Register</h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-400 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-400 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
