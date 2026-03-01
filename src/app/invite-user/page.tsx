'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { firebaseApp } from '../firebase'; 

const functions = getFunctions(firebaseApp);

// 1. Definimos la estructura de la respuesta de la función
interface CreateUserResult {
  status: 'success' | 'error';
  userId?: string;
  message?: string;
}

// 2. Le decimos a httpsCallable que la respuesta tendrá la forma de CreateUserResult
const createNewUser = httpsCallable<any, CreateUserResult>(functions, 'createNewUser');

export default function UserInvitation() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seller');
  const [pointOfSaleId, setPointOfSaleId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const result: HttpsCallableResult<CreateUserResult> = await createNewUser({ 
        userEmail: email, 
        userPassword: password, 
        role,
        pointOfSaleId
      });
      
      // 3. TypeScript ahora sabe que result.data tiene .status, .userId?, y .message?
      if (result.data.status === 'success') {
        setSuccess(`¡Usuario creado con éxito! User ID: ${result.data.userId}`);
        // Limpiar formulario
        setEmail('');
        setPassword('');
        setPointOfSaleId('');
      } else {
        // Si el estado es 'error', usamos el mensaje que nos envía la función
        setError(result.data.message || 'La función no retornó un estado de éxito.');
      }

    } catch (err: any) {
      console.error("Error al llamar la función:", err);
      // Este error captura fallos de red o si la función no se puede invocar
      setError(err.message || "Ocurrió un error desconocido al contactar el servidor.");
    }
  };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">Invitar Nuevo Usuario</h1>
                <form onSubmit={handleInvitation} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña Temporal</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300">Rol</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="seller">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pointOfSaleId" className="block text-sm font-medium text-gray-300">ID del Punto de Venta</label>
                        <input
                            id="pointOfSaleId"
                            type="text"
                            value={pointOfSaleId}
                            onChange={(e) => setPointOfSaleId(e.target.value)}
                            required
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    >
                        Crear y Enviar Invitación
                    </button>
                </form>
                {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                {success && <p className="mt-4 text-center text-green-400">{success}</p>}
            </div>
        </div>
    );
}
