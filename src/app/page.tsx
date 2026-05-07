import Navbar from "@/components/navbar";
import { SignInButton, Show } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          El motor financiero de <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            tus ventas de hardware
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          La billetera virtual exclusiva para vendedores. Recibí pagos automáticamente, revisá tus métricas y gestioná tus retiros de dinero en un solo lugar.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                Empezar a cobrar hoy
              </button>
            </SignInButton>
          </Show>
          
          <Show when="signed-in">
            <Link 
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Abrir mi Panel
            </Link>
          </Show>

        </div>
      </main>
    </div>
  );
}