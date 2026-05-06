import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white border-b border-gray-200">
      {/* Logo / Nombre */}
      <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
        CompuLibre <span className="text-gray-800">Payments</span>
      </Link>

      {/* Botones de Autenticación */}
      <div>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors shadow-sm">
              Ingresar
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Ir a mi Panel
            </Link>
            {/* El redireccionamiento ahora es automático por defecto */}
            <UserButton />
          </div>
        </Show>
      </div>
    </nav>
  );
}