"use client";
import Link from "next/link";
import { UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";

export default function Navbar() {
  

  return (
    <nav className="h-16 flex justify-between items-center py-4 px-8 bg-white border-b border-gray-200 print:hidden">
      {/* Logo / Nombre */}
      <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
        CompuLibre <span className="text-gray-800">Payments</span>
      </Link>

      {/* Menú de usuario */}
      <div className="flex items-center gap-4">
        
        {/* Mientras Clerk busca los datos del usuario en el cliente, mostramos el círculo gris */}
        <ClerkLoading>
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
        </ClerkLoading>

        {/* Cuando Clerk ya cargó en el navegador, mostramos el botón real */}
        <ClerkLoaded>
          <UserButton/>
        </ClerkLoaded>
        
      </div>
    </nav>
  );
}