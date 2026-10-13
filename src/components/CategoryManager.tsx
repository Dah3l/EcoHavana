import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import { useCategories, Category } from '../context/CategoryContext';

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', icon: '' });
    setShowForm(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', icon: '' });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      closeForm();
    } catch (err) {
      console.error('Error guardando categoría:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      await deleteCategory(category.id);
    }
  };

  return (
    <div className="bg-white dark:bg-[#151B24] rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-white/10 overflow-hidden transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#111827] dark:text-slate-100">Categorías</h2>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-1 bg-[#16A34A] dark:bg-[#22C55E] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#15803D] dark:hover:bg-[#16A34A] transition-colors"
        >
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {categories.map((category) => (
          <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#16A34A]/10 dark:bg-[#22C55E]/10 rounded-xl flex items-center justify-center text-xl">
                {category.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827] dark:text-slate-200">{category.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">/{category.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditForm(category)}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151B24] rounded-2xl p-6 w-full max-w-md border border-transparent dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111827] dark:text-slate-100">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={closeForm}
                className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F14] text-[#111827] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#16A34A] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#16A34A]/20 dark:focus:ring-[#22C55E]/20 transition-colors"
                  placeholder="Ej: Estaciones de Energía"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F14] text-[#111827] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#16A34A] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#16A34A]/20 dark:focus:ring-[#22C55E]/20 transition-colors disabled:opacity-50"
                  placeholder="ej: estaciones-de-energia"
                  required
                  disabled={!!editingCategory}
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  {editingCategory ? 'El slug no se puede cambiar' : 'Se genera automáticamente del nombre'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">
                  Icono (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F14] text-[#111827] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#16A34A] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#16A34A]/20 dark:focus:ring-[#22C55E]/20 transition-colors"
                  placeholder="Ej: 🔋"
                  required
                  maxLength={4}
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  Usa un emoji como icono de la categoría
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#16A34A] dark:bg-[#22C55E] text-white rounded-xl font-medium hover:bg-[#15803D] dark:hover:bg-[#16A34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingCategory ? 'Guardar' : 'Crear'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
