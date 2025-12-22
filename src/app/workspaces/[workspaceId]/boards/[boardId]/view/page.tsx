import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { Metadata } from "next";
import BoardViewClient from "./BoardViewClient";

type Props = {
  params: { boardId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = params;

  const { data: board } = await supabaseAdmin
    .from("boards")
    .select("title")
    .eq("id", boardId)
    .single();

  const title = board?.title
    ? `${board.title} | TaskFlow`
    : "Board View | TaskFlow";
  const description = board?.title
    ? `View and manage tasks for ${board.title}.`
    : "View and manage your tasks.";

  return {
    title,
    description,
  };
}

const Page = () => {
  return <BoardViewClient />;
};

export default Page;
