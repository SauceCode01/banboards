"use client";
import React from "react";

interface BoardListSkeletonProps {
  cards?: number;
}

export const BoardListSkeleton: React.FC<BoardListSkeletonProps> = ({ cards = 5 }) => {
  return (
    <div className="flex flex-col w-72 shrink-0 max-h-full">
      <div className="sticky top-0 z-10 rounded-t-md border border-b-0 border-slate-700 px-3 py-2 bg-slate-900/60">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-3 w-24 bg-slate-700 rounded" />
          <div className="h-3 w-6 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto border border-t-0 border-slate-700 p-3 space-y-2 bg-slate-900/40">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-slate-800 rounded-md border border-slate-700" />
          </div>
        ))}
      </div>
      <div className="shrink-0 border border-t-0 border-slate-700 p-3 rounded-b-md bg-slate-900/60">
        <div className="animate-pulse h-6 w-24 bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export default BoardListSkeleton;
