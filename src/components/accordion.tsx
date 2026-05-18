"use client";

import { useState, ReactNode } from "react";

export default function Accordion({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      
      {/* EL BOTÓN (Reemplaza al <summary>) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-6 bg-gray-50/50 flex justify-between items-center hover:bg-gray-100 transition-colors focus:outline-none ${
          isOpen ? "border-b border-gray-100" : ""
        }`}
      >
        <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* EL CONTENEDOR ANIMADO (El truco del grid) */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
      
    </div>
  );
}