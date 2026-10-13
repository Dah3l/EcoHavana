import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Lock, Plus, Edit, Trash2, Eye, LogOut, Package, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { categories, categoryNames, Product } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { uploadImage, resolveImageUrl, fileToDataUrl } from '../lib/storage';

export default function Admin() {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  const openForm = (product: Product | null = null) => {
    setEditingProduct(product);
    setUploadedImages(product?.images || []);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setUploadedImages([]);
    setIsDragging(false);
    setUploading(false);
  };

  // Procesar archivos seleccionados y subirlos
  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      // Mostrar previsualizaciones inmediatas (dataURL)
      const previews: string[] = [];
      for (const file of imageFiles) {
        const preview = await fileToDataUrl(file);
        previews.push(preview);
      }
      setUploadedImages(prev => [...prev, ...previews]);
      
      // Subir imágenes al storage (en background)
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        try {
          const url = await uploadImage(file);
          uploadedUrls.push(url);
        } catch (err) {
          console.error('Error uploading file:', err);
        }
      }
      
      // Reemplazar previews con URLs reales
      if (uploadedUrls.length > 0) {
        setUploadedImages(prev => {
          const newImages = [...prev];
          // Reemplazar las últimas N imágenes (los previews) con las URLs subidas
          const startIndex = newImages.length - previews.length;
          for (let i = 0; i < uploadedUrls.length; i++) {
            if (startIndex + i < newImages.length) {
              newImages[startIndex + i] = uploadedUrls[i];
            }
          }
          return newImages;
        });
      }
    } catch (err) {
      console.error('Error processing files:', err);
    } finally {
      setUploading(false);
    }
  };

  // Click en el área de subida
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Cambio en el input file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input para permitir subir el mismo archivo otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  // Eliminar imagen
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Mover imagen (hacerla principal)
  const makePrimary = (index: number) => {
    if (index === 0) return;
    setUploadedImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(index, 1);
      newImages.unshift(moved);
      return newImages;
    });
  };

  // Guardar producto
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string) || 0,
      category: formData.get('category') as Product['category'],
      specs: (formData.get('specs') as string).split('\n').filter(s => s.trim()),
      warranty: formData.get('warranty') as string,
      transport: formData.get('transport') as string,
      images: uploadedImages,
      offer: formData.get('offer') === 'on',
      isNew: formData.get('isNew') === 'on',
      visible: formData.get('visible') === 'on',
    };
    
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        ...productData,
      };
      addProduct(newProduct);
    }
    
    closeForm();
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="text-[#16A34A]" size={24} />
            </div>
            <h1 className="text-xl font-bold text-[#111827]">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Acceso solo para administradores</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#16A34A]"
                placeholder="admin@energicuba.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#16A34A]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#16A34A] text-white rounded-xl font-medium hover:bg-[#15803D] transition-colors"
            >
              Iniciar sesión
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            Solo administradores autorizados. Sin registro público.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Panel Admin</h1>
          <p className="text-gray-500 text-sm">Gestión de productos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openForm(null)}
            className="flex items-center gap-1 bg-[#16A34A] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15803D] transition-colors"
          >
            <Plus size={16} /> Nuevo
          </button>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#111827]">{products.length}</p>
          <p className="text-xs text-gray-500">Total productos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#16A34A]">{products.filter(p => p.offer).length}</p>
          <p className="text-xs text-gray-500">En oferta</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#111827]">{products.filter(p => p.isNew).length}</p>
          <p className="text-xs text-gray-500">Nuevos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#111827]">{categories.length - 1}</p>
          <p className="text-xs text-gray-500">Categorías</p>
        </div>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#111827] mb-4">
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <form className="space-y-3" onSubmit={handleSaveProduct}>
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <input name="name" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" defaultValue={editingProduct?.name || ''} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea name="description" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" rows={3} defaultValue={editingProduct?.description || ''} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Precio USD</label>
                  <input name="price" type="number" step="0.01" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" defaultValue={editingProduct?.price || ''} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <select name="category" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" defaultValue={editingProduct?.category || 'estaciones'}>
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Especificaciones (una por línea)</label>
                <textarea name="specs" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" rows={3} defaultValue={editingProduct?.specs.join('\n') || ''} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Garantía</label>
                  <input name="warranty" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" defaultValue={editingProduct?.warranty || ''} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transporte</label>
                  <input name="transport" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" defaultValue={editingProduct?.transport || ''} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input name="offer" type="checkbox" value="on" className="rounded" defaultChecked={editingProduct?.offer || false} />
                  <span className="text-sm">Oferta</span>
                </label>
                <label className="flex items-center gap-2">
                  <input name="isNew" type="checkbox" value="on" className="rounded" defaultChecked={editingProduct?.isNew || false} />
                  <span className="text-sm">Nuevo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input name="visible" type="checkbox" value="on" className="rounded" defaultChecked={editingProduct?.visible ?? true} />
                  <span className="text-sm">Visible</span>
                </label>
              </div>

              {/* ============================================
                  ZONA DE SUBIDA DE FOTOS (FUNCIONAL CON STORAGE)
                  ============================================ */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fotos del producto
                </label>

                {/* Input file oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Área de drop / click */}
                <div
                  onClick={handleUploadClick}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-[#16A34A] bg-[#16A34A]/5 scale-[1.02]'
                      : uploading
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-[#16A34A]/50 hover:bg-gray-50'
                  }`}
                >
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isDragging ? 'bg-[#16A34A]/20' : uploading ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {uploading ? (
                      <Loader2 className="text-blue-500 animate-spin" size={22} />
                    ) : (
                      <Upload className={`transition-colors ${isDragging ? 'text-[#16A34A]' : 'text-gray-400'}`} size={22} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {uploading ? 'Subiendo imágenes...' : isDragging ? '¡Suelta las imágenes aquí!' : 'Haz clic o arrastra imágenes'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG o WEBP • Se comprimen automáticamente</p>
                </div>

                {/* Previsualizaciones */}
                {uploadedImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      {uploadedImages.length} imagen{uploadedImages.length !== 1 ? 'es' : ''} seleccionada{uploadedImages.length !== 1 ? 's' : ''}
                      {uploadedImages.length > 1 && ' • La primera será la principal'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={resolveImageUrl(img)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Badge de imagen principal */}
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-[#16A34A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Principal
                            </span>
                          )}
                          {/* Overlay con acciones */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); makePrimary(index); }}
                                className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                title="Hacer principal"
                              >
                                <ImageIcon size={14} className="text-[#16A34A]" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                              className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                              title="Eliminar"
                            >
                              <X size={14} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Botón añadir más */}
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-[#16A34A] hover:bg-[#16A34A]/5 flex flex-col items-center justify-center gap-1 transition-all"
                      >
                        <Plus size={20} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400">Añadir</span>
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Package size={12} />
                  Las imágenes se guardan automáticamente (localStorage o Supabase Storage)
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#16A34A] text-white rounded-xl font-medium hover:bg-[#15803D]">
                  {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={resolveImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827] truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {categoryNames[product.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111827]">${product.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.visible && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Visible</span>}
                      {product.offer && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Oferta</span>}
                      {product.isNew && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Nuevo</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-[#16A34A] hover:bg-green-50 rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openForm(product)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${product.name}"?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase info */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-2">
          <Package size={16} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Backend: Supabase</p>
            <p className="text-xs text-blue-600 mt-1">
              En producción, este panel se conecta a Supabase Auth para autenticación y a Postgres para CRUD de productos.
              Las imágenes se suben al bucket "products" de Supabase Storage. Actualmente usa localStorage como fallback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
