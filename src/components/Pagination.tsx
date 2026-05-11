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
        className="text-gray-700 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <span className="font-semibold text-gray-700">Página {currentPage}</span>
      <button
        disabled={!hasMore}
        onClick={() => changePage(currentPage + 1)}
        className="text-gray-700 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
}