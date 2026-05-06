import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

//rutas PÚBLICAS
const isPublicRoute = createRouteMatcher([
  '/api/payments/checkout(.*)',
  '/api/webhooks/mercadopago(.*)'
]);


export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
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