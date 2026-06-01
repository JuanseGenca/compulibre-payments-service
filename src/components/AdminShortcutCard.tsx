import Link from "next/link";
import React from "react";

interface AdminShortcutCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorScheme: "blue" | "purple" | "red";
}

export function AdminShortcutCard({
  href,
  title,
  description,
  icon,
  colorScheme,
}: AdminShortcutCardProps) {
  const colorStyles = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      hoverIcon: "group-hover:text-blue-500",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      hoverIcon: "group-hover:text-purple-500",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      hoverIcon: "group-hover:text-red-500",
    },
  };

  const currentColors = colorStyles[colorScheme];

  return (
    <Link
      href={href}
      className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 shrink-0 ${currentColors.bg} ${currentColors.text} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      <svg
        className={`w-6 h-6 text-gray-300 ${currentColors.hoverIcon} transition-colors`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
