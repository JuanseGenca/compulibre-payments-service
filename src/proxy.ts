import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

//rutas PÚBLICAS
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/payments/checkout(.*)',
  '/api/webhooks/mercadopago(.*)',
  '/api/control-panel(.*)', 
  '/api/analytics(.*)'
]);


//rutas que son EXCLUSIVAS para administradores
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    // Clerk guarda la metadata en sessionClaims.metadata
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
});



export const config = {
  matcher: [
    // Ignoramos los archivos estáticos de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Aplicamos siempre a las rutas de la API
    '/(api|trpc)(.*)',
  ],
};