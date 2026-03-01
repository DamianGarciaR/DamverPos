'use client';

import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { db } from '../../firebase'; // RUTA CORREGIDA
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Tipos
interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  variants: Variant[];
  priceLists: PriceList[];
  cost: number;
  requiresSerialNumber: boolean;
  isActive: boolean;
}

interface Variant {
  name: string; // Ej: "Rojo, L"
  sku: string;
  stock: number;
  minStock: number;
  maxStock: number;
}

interface PriceList {
  name: string;
  price: number;
  isDefault: boolean;
}

type FormValues = Omit<Product, 'id'>;

interface Props {
  product: Product | null;
  onClose: () => void;
  companyId: string;
}

export default function ProductForm({ product, onClose, companyId }: Props) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormValues>({
    defaultValues: product ? 
      { ...product, cost: product.cost || 0 } : 
      {
        name: '',
        sku: '',
        barcode: '',
        cost: 0,
        requiresSerialNumber: false,
        isActive: true,
        variants: [{ name: 'Única', sku: '', stock: 0, minStock: 0, maxStock: 0 }],
        priceLists: [{ name: 'General', price: 0, isDefault: true }]
      }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" });
  const { fields: priceListFields, append: appendPriceList, remove: removePriceList } = useFieldArray({ control, name: "priceLists" });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const processedData = {
        ...data,
        cost: Number(data.cost) || 0,
        variants: data.variants.map(v => ({...v, stock: Number(v.stock) || 0, minStock: Number(v.minStock) || 0, maxStock: Number(v.maxStock) || 0})),
        priceLists: data.priceLists.map(pl => ({...pl, price: Number(pl.price) || 0}))
    };

    try {
      if (product) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, {
          ...processedData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "products"), {
          ...processedData,
          companyId: companyId,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving product: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            {/* Datos Generales */}
            <div className="p-4 border border-slate-700 rounded-lg space-y-4">
                <h3 class="text-lg font-semibold text-white">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300">Nombre del Producto</label>
                        <input {...register('name', { required: 'El nombre es obligatorio' })} className="mt-1 w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                        {errors.name && <p class="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300">SKU (Código principal)</label>
                        <input {...register('sku')} className="mt-1 w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300">Código de Barras</label>
                        <input {...register('barcode')} className="mt-1 w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                            <input type="checkbox" {...register('requiresSerialNumber')} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-600" />
                            <span>Requiere N° de Serie</span>
                        </label>
                         {product && (
                            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                                <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-600" />
                                <span>Producto Activo</span>
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Variantes y Stock */}
            <div className="p-4 border border-slate-700 rounded-lg space-y-4">
                <h3 class="text-lg font-semibold text-white">Variantes y Stock</h3>
                {variantFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-900 rounded-md relative">
                        <input type="text" placeholder="Nombre (ej. Rojo, L)" {...register(`variants.${index}.name`, { required: true })} className="md:col-span-2 w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                        <input type="number" placeholder="Stock" {...register(`variants.${index}.stock`)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                        <input type="number" placeholder="Stock Mín." {...register(`variants.${index}.minStock`)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                        <input type="number" placeholder="Stock Máx." {...register(`variants.${index}.maxStock`)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                        {variantFields.length > 1 && <button type="button" onClick={() => removeVariant(index)} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold">X</button>}
                    </div>
                ))}
                <button type="button" onClick={() => appendVariant({ name: '', sku: '', stock: 0, minStock: 0, maxStock: 0 })} className="text-sm text-blue-400 hover:text-blue-300">+ Añadir Variante</button>
            </div>

            {/* Precios y Costo */}
            <div className="p-4 border border-slate-700 rounded-lg space-y-4">
                 <h3 class="text-lg font-semibold text-white">Precios y Costos</h3>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300">Costo</label>
                        <input type="number" step="0.01" {...register('cost')} className="mt-1 w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                    </div>
                 </div>
                 <div className="space-y-3 mt-4">
                    <h4 class="text-md font-semibold text-slate-200">Listas de Precios</h4>
                    {priceListFields.map((field, index) => {
                         const cost = watch('cost') || 0;
                         const price = watch(`priceLists.${index}.price`) || 0;
                         const margin = cost > 0 ? ((price - cost) / cost) * 100 : 0;

                        return (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-900 rounded-md relative">
                                <input placeholder="Nombre Lista" {...register(`priceLists.${index}.name`, { required: true })} className="md:col-span-2 w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                                <div className='relative'>
                                   <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$</span>
                                   <input type="number" step="0.01" placeholder="Precio" {...register(`priceLists.${index}.price`)} className="w-full pl-7 bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                                </div>
                               <div class="flex items-center justify-center text-sm text-slate-300">
                                    <span>Margen: {margin.toFixed(2)}%</span>
                                </div>
                                {priceListFields.length > 1 && <button type="button" onClick={() => removePriceList(index)} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold">X</button>}
                            </div>
                        )
                    })}
                    <button type="button" onClick={() => appendPriceList({ name: '', price: 0, isDefault: false })} className="text-sm text-blue-400 hover:text-blue-300">+ Añadir Lista de Precio</button>
                 </div>
            </div>
          </div>

          <div className="bg-slate-700 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-slate-500 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-600">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
