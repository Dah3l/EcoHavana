/**
 * Servicio de almacenamiento de imágenes
 * 
 * En producción: sube a Supabase Storage bucket "products"
 * En demo/dev: guarda en localStorage como base64
 */

import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_PREFIX = 'ecohavana_img_';
const MAX_LOCAL_STORAGE_IMAGES = 20;
const BUCKET_NAME = 'products';

// Generar nombre de archivo único
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${random}.${ext}`;
};

// Comprimir imagen antes de guardar (reduce tamaño)
const compressImage = (dataUrl: string, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Escalar si es más grande que maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Subir una imagen y retornar la URL pública
 */
export const uploadImage = async (file: File): Promise<string> => {
  // Convertir a dataURL para compresión
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Comprimir imagen
  const compressed = await compressImage(dataUrl);

  // Si Supabase está configurado, subir al bucket
  if (isSupabaseConfigured()) {
    try {
      const fileName = generateFileName(file.name);
      
      // Convertir dataURL a Blob
      const blob = await fetch(compressed).then(r => r.blob());
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob, {
          contentType: file.type,
          upsert: false,
        });
      
      if (error) throw error;
      
      // Retornar URL pública
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase upload failed, falling back to localStorage:', err);
    }
  }

  // Fallback: guardar en localStorage
  return saveToLocal(compressed);
};

/**
 * Subir múltiples imágenes
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    try {
      const url = await uploadImage(file);
      urls.push(url);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  }
  return urls;
};

/**
 * Guardar en localStorage (fallback)
 */
const saveToLocal = (dataUrl: string): string => {
  // Limpiar imágenes antiguas si hay muchas
  cleanOldImages();
  
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const key = `${STORAGE_PREFIX}${id}`;
  
  try {
    localStorage.setItem(key, dataUrl);
    return `local://${id}`;
  } catch (e) {
    console.error('localStorage full, returning dataUrl directly');
    // Si localStorage está lleno, retornar el dataUrl directamente
    return dataUrl;
  }
};

/**
 * Resolver una URL de imagen (local:// o URL real)
 */
export const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si es una URL local, buscar en localStorage
  if (url.startsWith('local://')) {
    const id = url.replace('local://', '');
    const key = `${STORAGE_PREFIX}${id}`;
    return localStorage.getItem(key) || '';
  }
  
  // Si ya es dataUrl (base64)
  if (url.startsWith('data:')) {
    return url;
  }
  
  // URL externa (Supabase, etc.)
  return url;
};

/**
 * Eliminar una imagen del storage
 */
export const deleteImage = async (url: string): Promise<void> => {
  if (url.startsWith('local://')) {
    const id = url.replace('local://', '');
    localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    return;
  }
  
  // Si es una URL de Supabase Storage
  if (isSupabaseConfigured() && url.includes('supabase.co') && url.includes('/storage/')) {
    try {
      // Extraer el nombre del archivo de la URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      }
    } catch (err) {
      console.error('Error deleting image from Supabase:', err);
    }
  }
};

/**
 * Limpiar imágenes antiguas del localStorage
 */
const cleanOldImages = () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
  if (keys.length > MAX_LOCAL_STORAGE_IMAGES) {
    // Ordenar por timestamp (los más viejos primero)
    keys.sort();
    const toRemove = keys.slice(0, keys.length - MAX_LOCAL_STORAGE_IMAGES);
    toRemove.forEach(key => localStorage.removeItem(key));
  }
};

/**
 * Procesar un archivo y convertirlo a dataURL (para previsualización inmediata)
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
