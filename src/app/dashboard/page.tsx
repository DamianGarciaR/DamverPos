'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth, signOut, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { firebaseApp } from '../firebase';
import { useEffect, useState } from 'react';
import { FiGrid, FiFileText, FiUsers, FiPackage, FiBriefcase, FiTrendingUp, FiBox, FiDollarSign, FiUser, FiLogOut, FiHelpCircle, FiAlertTriangle, FiPhone, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

interface UserClaims {
  role?: 'admin' | 'supervisor' | 'seller';
  companyId?: string;
}

// Componente para los items del menú rápido
const QuickMenuItem = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
  <Link href={href} className="flex flex-col items-center justify-center p-4 bg-white text-gray-700 rounded-lg shadow-md hover:bg-blue-50 transition-colors border border-gray-200">
    <div className="text-3xl text-blue-500 mb-2">{icon}</div>
    <span className="text-sm font-semibold">{label}</span>
  </Link>
);

export default function DashboardPage() {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDate(today.toLocaleDateString('es-AR', options).toUpperCase());
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user, true); // Force refresh
        setClaims(tokenResult.claims as UserClaims);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
            <p>Cargando...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 min-w-[1280px]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}>
      {/* Barra Lateral */}
      <aside className="w-60 bg-white shadow-lg flex flex-col flex-shrink-0">
        <div className="p-6 text-center border-b">
           <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-500 text-sm">Tu Logo Aquí</span>
            </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center p-3 rounded-lg text-blue-600 bg-blue-100 font-bold"><FiGrid className="mr-3" /> Dashboard</Link>
          <Link href="#" className="flex items-center p-3 rounded-lg text-blue-600 hover:bg-blue-50"><FiFileText className="mr-3" /> Comprobantes</Link>
          <Link href="/management/customers" className="flex items-center p-3 rounded-lg text-blue-600 hover:bg-blue-50"><FiUsers className="mr-3" /> Clientes</Link>
          <Link href="/management/products" className="flex items-center p-3 rounded-lg text-blue-600 hover:bg-blue-50"><FiPackage className="mr-3" /> Inventario</Link>
          <Link href="#" className="flex items-center p-3 rounded-lg text-blue-600 hover:bg-blue-50"><FiBriefcase className="mr-3" /> Sucursales</Link>
        </nav>
        <div className="p-4 border-t">
            <button onClick={handleLogout} className="flex items-center p-3 rounded-lg text-red-500 hover:bg-red-100 w-full">
                <FiLogOut className="mr-3" /> Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
            <span className='font-semibold text-gray-600'>{date}</span>
            <div className='flex items-center text-blue-600 font-bold'>
                <FiUser className='mr-2'/>
                <span>VEROCNATURA</span>
            </div>
        </header>

        <div className='px-6 py-2 bg-blue-900 text-white text-xs text-center'>
            OFICIAL Compra $1,370,00 - Venta $1,420,00 | BLUE Compra $1.405,00 - Venta $1.425,00 | MEP Compra $1.406,30 - Venta $1,427,40 | TARJETA Compra $1.781,00 - Venta $1.846,00
        </div>
        <div className='px-6 py-2 bg-red-600 text-white text-sm text-center flex items-center justify-center'>
            <FiAlertTriangle className='mr-2'/>
            ¡DEMO ACTIVA! Estás utilizando una cuenta de demostración. Para acceder a todas las características, por favor contacta a soporte para actualizar tu plan.
        </div>

        <div className="flex-grow p-6 grid grid-cols-3 gap-6">
          {/* Menú Rápido */}
          <div className="col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border">
            <h2 className="text-xl font-bold mb-4 flex items-center"><FiGrid className="mr-2"/>Menú Rápido</h2>
            <div className="grid grid-cols-4 gap-4">
                <QuickMenuItem icon={<FiTrendingUp />} label="Venta" href="#" />
                <QuickMenuItem icon={<FiFileText />} label="Mis Comprobantes" href="#" />
                <QuickMenuItem icon={<FiDollarSign />} label="Cierres de Caja" href="#" />
                <QuickMenuItem icon={<FiUsers />} label="Mis Clientes" href="/management/customers" />
                <QuickMenuItem icon={<FiDollarSign />} label="Cuenta Corriente" href="#" />
                <QuickMenuItem icon={<FiPackage />} label="Mis Artículos" href="/management/products" />
                <QuickMenuItem icon={<FiBox />} label="Stock" href="#" />
                <QuickMenuItem icon={<FiBriefcase />} label="Sucursales" href="#" />
            </div>
          </div>

          {/* Información */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border">
            <h2 className="text-xl font-bold mb-4 flex items-center"><FiHelpCircle className="mr-2"/>Información</h2>
            <div className="text-center">
                <FiHelpCircle className="text-5xl text-blue-500 mx-auto mb-3"/>
                <h3 className="font-bold mb-1">¿Necesitas ayuda?</h3>
                <p className="text-sm text-gray-600 mb-4">Contáctanos por WhatsApp o Mail para soporte técnico</p>
                <div className='space-y-3 text-sm'>
                    <a href="https://wa.me/541141628281" target="_blank" className='flex items-center p-2 border rounded-lg hover:bg-gray-100'>
                        <FaWhatsapp className='mr-3 text-green-500'/>+54 1141628281
                    </a>
                     <a href="mailto:soporte@nubefiscal.com.ar" className='flex items-center p-2 border rounded-lg hover:bg-gray-100'>
                        <FiMail className='mr-3 text-gray-500'/>soporte@nubefiscal.com.ar
                    </a>
                </div>
            </div>
            <div className='mt-6 border-t pt-4 text-sm space-y-2'>
                <div className='flex justify-between items-center bg-gray-100 p-2 rounded'>
                    <span className='font-bold text-gray-600'>PLAN</span>
                    <span className='font-semibold'>DEMO</span>
                </div>
                <div className='flex justify-between items-center bg-gray-100 p-2 rounded'>
                    <span className='font-bold text-gray-600'>CUENTA</span>
                    <span className='font-semibold uppercase'>{claims?.role || 'N/A'}</span>
                </div>
            </div>
          </div>
        </div>

        <footer className="text-center p-4 text-sm text-gray-500">
          © 2026 - nubefiscal
        </footer>
      </main>
    </div>
  );
}
