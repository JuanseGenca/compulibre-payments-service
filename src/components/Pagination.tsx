"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ currentPage, hasMore }: { currentPage: number; hasMore: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex justify-center items-center gap-4 py-8">
      <button
        disabled={currentPage <= 1}
        onClick={() => changePage(currentPage - 1)}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl transition-all duration-200 
                   hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 shadow-sm disabled:shadow-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Anterior
      </button>
      <span className="font-semibold text-gray-700">Página {currentPage}</span>
      <button
        disabled={!hasMore}
        onClick={() => changePage(currentPage + 1)}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl transition-all duration-200 
                   hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 shadow-sm disabled:shadow-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Siguiente
      </button>
    </div>
  );
}