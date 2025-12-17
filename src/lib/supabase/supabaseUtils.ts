import { supabase } from "./supabaseClient";

export const getSession = async () => {
  // 1. Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

export const supabaseFetch = async (
  input: URL | RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const session = await getSession();
  const reponse = fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${session?.access_token || ""}`,
      ...init?.headers,
    },
  });
  return reponse;
};
