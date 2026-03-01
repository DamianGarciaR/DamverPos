'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from '../firebase'; // Asegúrate que esta ruta es correcta

const functions = getFunctions(firebaseApp);
const createNewUser = httpsCallable(functions, 'createNewUser');

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
      const result = await createNewUser({ 
        userEmail: email, 
        userPassword: password, 
        role,
        pointOfSaleId
      });
      
      if (result.data.status === 'success') {
        setSuccess(`¡Usuario creado con éxito! User ID: ${result.data.userId}`);
        // Limpiar formulario
        setEmail('');
        setPassword('');
        setPointOfSaleId('');
      } else {
        throw new Error('La función no retornó un estado de éxito.');
      }

    } catch (err: any) {
      console.error("Error al crear el usuario:", err);
      setError(err.message || "Ocurrió un error desconocido.");
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-center text-white">Invitar Nuevo Usuario</h2>
      
      {error && <p className="text-red-500 text-center p-3 bg-red-900 rounded-lg">{error}</p>}
      {success && <p className="text-green-500 text-center p-3 bg-green-900 rounded-lg">{success}</p>}

      <form onSubmit={handleInvitation} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-400">Email del Usuario</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-400">Contraseña Temporal</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-400">Rol</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="seller">Vendedor</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-400">ID del Punto de Venta</label>
          <input
            type="text"
            value={pointOfSaleId}
            onChange={(e) => setPointOfSaleId(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-800"
        >
          Crear Usuario
        </button>
      </form>
    </div>
  );
}
