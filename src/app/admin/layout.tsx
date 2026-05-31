import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  
  // 2. Leemos el rol directamente desde la metadata inyectada en el token
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // 3. Validamos la seguridad
  if (!userId || role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 2. El Navbar se renderiza acá para todas las subpáginas */}
      <Navbar /> 
      
      {/* children es la página específica que el usuario esté visitando */}
      {children} 
    </div>
  );
}