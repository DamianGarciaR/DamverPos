'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, firebaseApp } from '../../firebase'; // RUTA CORREGIDA
import ProductForm from '../components/ProductForm';
import { getAuth, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

// Tipos de datos
interface Product {
  id: string;
  name: string;
  sku: string; // Código de producto principal
  totalStock: number;
  basePrice: number;
  isActive: boolean;
}

interface UserClaims {
  companyId?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user);
        setClaims(tokenResult.claims as UserClaims);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!claims?.companyId) {
      if (!loading) setProducts([]);
      return;
    }

    const q = query(collection(db, "products"), where("companyId", "==", claims.companyId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Calcular stock total sumando el de las variantes
        const totalStock = data.variants?.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0) || 0;
        const basePrice = data.priceLists?.find((p: any) => p.isDefault)?.price || 0;
        return { id: doc.id, ...data, totalStock, basePrice } as Product;
      });
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [claims, loading]);

  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return <div className="text-center p-8 text-white">Cargando productos...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">+ Nuevo Producto</button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-3 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg"
          />
        </div>

        <div className="bg-slate-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Stock Total</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Precio Base</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Estado</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{product.totalStock}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">${product.basePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-400">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isFormOpen && (
          <ProductForm 
            product={selectedProduct} 
            onClose={handleFormClose} 
            companyId={claims?.companyId || ''}
          />
        )}
      </div>
    </div>
  );
}
