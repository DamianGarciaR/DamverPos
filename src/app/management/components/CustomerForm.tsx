'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Tipos
interface Customer {
  id: string;
  name: string;
  cuit: string;
  vatCondition: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

type FormValues = Omit<Customer, 'id'>;

interface Props {
  customer: Customer | null;
  onClose: () => void;
  companyId: string;
}

const VAT_CONDITIONS = [
  "Responsable Inscripto",
  "Monotributista",
  "Exento",
  "Consumidor Final"
];

export default function CustomerForm({ customer, onClose, companyId }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: customer ? {
      ...customer,
    } : {
      name: '',
      cuit: '',
      vatCondition: 'Consumidor Final',
      email: '',
      phone: '',
      address: '',
      isActive: true
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      if (customer) {
        // Actualizar cliente existente
        const customerRef = doc(db, "customers", customer.id);
        await updateDoc(customerRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        // Crear nuevo cliente
        await addDoc(collection(db, "customers"), {
          ...data,
          companyId: companyId,
          currentAccountBalance: 0, // Saldo inicial
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving customer: ", error);
      // Aquí podrías mostrar un error al usuario
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">{customer ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nombre Completo o Razón Social</label>
                <input id="name" {...register('name', { required: 'El nombre es obligatorio' })} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* CUIT */}
              <div>
                <label htmlFor="cuit" className="block text-sm font-medium text-slate-300">CUIT</label>
                <input id="cuit" {...register('cuit', { 
                    required: 'El CUIT es obligatorio', 
                    pattern: { value: /^\d{11}$/, message: 'Debe ser un CUIT válido de 11 dígitos sin guiones' } 
                })} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
                {errors.cuit && <p className="mt-1 text-sm text-red-500">{errors.cuit.message}</p>}
              </div>

              {/* Condición IVA */}
              <div>
                <label htmlFor="vatCondition" className="block text-sm font-medium text-slate-300">Condición frente al IVA</label>
                <select id="vatCondition" {...register('vatCondition', { required: true })} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white">
                  {VAT_CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                </select>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                <input id="email" type="email" {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Email no válido' } })} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Teléfono</label>
                <input id="phone" {...register('phone')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
              </div>

               {/* Dirección */}
               <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-300">Dirección</label>
                <input id="address" {...register('address')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
              </div>

               {/* Estado */}
               {customer && (
                <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 text-sm font-medium text-slate-300">
                        <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500" />
                        <span>Cliente Activo</span>
                    </label>
                </div>
                )}
            </div>
          </div>

          <div className="bg-slate-700 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-slate-500 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-600">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
