import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            FacturaPRO
          </Link>
          <nav>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Acceder
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="text-center py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Sistema de Facturación Inteligente para tu Negocio
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-slate-400">
            Gestiona tus facturas, clientes y productos de forma sencilla y eficiente. Cumple con todas las normativas fiscales de Argentina.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg"
            >
              Comienza Gratis
            </Link>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Funcionalidades Destacadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-slate-800 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-2">Multiempresa y Multipunto de Venta</h3>
                <p className="text-slate-400">
                  Administra hasta 3 empresas y 3 puntos de venta desde una única cuenta.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold mb-2">Control de Stock Avanzado</h3>
                <p className="text-slate-400">
                  Trazabilidad por número de serie y control de inventario en tiempo real.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-2">Cuentas Corrientes de Clientes</h3>
                <p className="text-slate-400">
                  Lleva un registro detallado de los saldos y movimientos de tus clientes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-slate-500">
        <p>&copy; 2024 FacturaPRO. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
