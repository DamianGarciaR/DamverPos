'use client';

import Link from 'next/link';

export default function RequestAccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white">Solicitar Acceso a FacturaPRO</h1>
        <p className="text-slate-400">
          El registro de nuevas empresas se gestiona de forma interna.
          Si deseas dar de alta tu negocio en nuestra plataforma, por favor, contacta con nuestro equipo de soporte.
        </p>
        <p className="text-slate-300">
          Email de Soporte: <a href="mailto:soporte@facturapro.com" className="text-blue-500 hover:underline">soporte@facturapro.com</a>
        </p>
        <div className="mt-6">
          <Link href="/login" className="font-medium text-blue-500 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
