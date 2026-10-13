/**
 * Script de Diagnóstico para Supabase
 * Ejecuta este archivo en la consola del navegador (F12) para verificar la conexión
 */

import { supabase, isSupabaseConfigured } from './supabase';

export const diagnostic = {
  /**
   * Verificar configuración básica
   */
  checkConfig: () => {
    console.log('🔍 === DIAGNÓSTICO SUPABASE ===\n');
    console.log('1️⃣ Configuración:');
    console.log('   - Supabase configurado:', isSupabaseConfigured());
    console.log('   - URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('   - Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    console.log('');
    return isSupabaseConfigured();
  },

  /**
   * Probar conexión básica
   */
  testConnection: async () => {
    console.log('2️⃣ Probando conexión...');
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('   ❌ Error de conexión:', error.message);
        console.error('   - Código:', error.code);
        console.error('   - Detalles:', error.details);
        console.error('   - Hint:', error.hint);
        return false;
      }
      
      console.log('   ✅ Conexión exitosa');
      console.log('   - Total de productos:', data);
      return true;
    } catch (err: any) {
      console.error('   ❌ Error inesperado:', err.message);
      return false;
    }
  },

  /**
   * Verificar estructura de tablas
   */
  checkTables: async () => {
    console.log('\n3️⃣ Verificando tablas...');
    
    // Verificar categories
    const { error: catError } = await supabase.from('categories').select('id').limit(1);
    if (catError) {
      console.error('   ❌ Tabla categories:', catError.message);
    } else {
      console.log('   ✅ Tabla categories: OK');
    }
    
    // Verificar products
    const { error: prodError } = await supabase.from('products').select('id').limit(1);
    if (prodError) {
      console.error('   ❌ Tabla products:', prodError.message);
    } else {
      console.log('   ✅ Tabla products: OK');
    }
    
    // Verificar columna is_featured
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('is_featured')
      .limit(1);
    
    if (testError) {
      console.error('   ❌ Columna is_featured:', testError.message);
      console.error('   💡 Solución: Ejecuta migration_add_featured.sql');
    } else {
      console.log('   ✅ Columna is_featured: OK');
    }
  },

  /**
   * Verificar autenticación
   */
  checkAuth: async () => {
    console.log('\n4️⃣ Verificando autenticación...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('   ❌ Error obteniendo sesión:', error.message);
      return false;
    }
    
    if (session) {
      console.log('   ✅ Usuario autenticado');
      console.log('   - Email:', session.user.email);
      console.log('   - ID:', session.user.id);
      return true;
    } else {
      console.log('   ⚠️ No hay sesión activa');
      console.log('   💡 Inicia sesión en /admin');
      return false;
    }
  },

  /**
   * Probar operaciones CRUD
   */
  testCRUD: async () => {
    console.log('\n5️⃣ Probando operaciones CRUD...');
    
    // READ
    console.log('   📖 READ:');
    const { data: readData, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (readError) {
      console.error('      ❌ Error leyendo:', readError.message);
    } else {
      console.log('      ✅ Lectura exitosa');
      console.log('      - Productos encontrados:', readData?.length || 0);
    }
    
    // CREATE (solo si está autenticado)
    console.log('   ➕ CREATE:');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('      ⚠️ Saltando (no autenticado)');
    } else {
      const testProduct = {
        name: 'TEST PRODUCT - DELETE ME',
        description: 'Producto de prueba',
        price: 999.99,
        category_id: (await supabase.from('categories').select('id').eq('slug', 'estaciones').single()).data?.id,
        specs: ['Test spec'],
        images: [],
        warranty: 'Test',
        transport: 'Test',
        is_offer: false,
        is_new: false,
        is_featured: false,
        is_visible: false,
      };
      
      const { data: createData, error: createError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();
      
      if (createError) {
        console.error('      ❌ Error creando:', createError.message);
        console.error('      💡 Verifica las políticas RLS');
      } else {
        console.log('      ✅ Creación exitosa');
        console.log('      - ID generado:', createData?.id);
        
        // DELETE el producto de prueba
        console.log('   🗑️ DELETE:');
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', createData.id);
        
        if (deleteError) {
          console.error('      ❌ Error eliminando:', deleteError.message);
        } else {
          console.log('      ✅ Eliminación exitosa');
        }
      }
    }
  },

  /**
   * Verificar Storage
   */
  checkStorage: async () => {
    console.log('\n6️⃣ Verificando Storage...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('   ❌ Error listando buckets:', error.message);
      return;
    }
    
    const productsBucket = buckets?.find(b => b.name === 'products');
    
    if (productsBucket) {
      console.log('   ✅ Bucket "products" existe');
      console.log('   - Público:', productsBucket.public);
    } else {
      console.error('   ❌ Bucket "products" no existe');
      console.error('   💡 Crea el bucket en Supabase → Storage');
    }
  },

  /**
   * Verificar políticas RLS
   */
  checkRLS: async () => {
    console.log('\n7️⃣ Verificando políticas RLS...');
    
    // Intentar insertar sin autenticación
    const { error } = await supabase
      .from('products')
      .insert({
        name: 'RLS TEST',
        price: 0,
        is_visible: false,
      });
    
    if (error && error.code === '42501') {
      console.log('   ✅ RLS funcionando correctamente');
      console.log('   - Inserción sin auth bloqueada (como debe ser)');
    } else if (!error) {
      console.error('   ⚠️ RLS no está bloqueando inserciones');
      console.error('   💡 Las políticas RLS pueden estar mal configuradas');
      
      // Limpiar el producto de prueba
      await supabase.from('products').delete().eq('name', 'RLS TEST');
    } else {
      console.error('   ❌ Error verificando RLS:', error.message);
    }
  },

  /**
   * Ejecutar diagnóstico completo
   */
  runFull: async () => {
    const configured = diagnostic.checkConfig();
    
    if (!configured) {
      console.error('\n❌ Supabase no está configurado');
      console.error('💡 Verifica las variables de entorno en .env.local');
      return;
    }
    
    const connected = await diagnostic.testConnection();
    
    if (!connected) {
      console.error('\n❌ No se pudo conectar a Supabase');
      return;
    }
    
    await diagnostic.checkTables();
    const authenticated = await diagnostic.checkAuth();
    await diagnostic.testCRUD();
    await diagnostic.checkStorage();
    await diagnostic.checkRLS();
    
    console.log('\n=== FIN DEL DIAGNÓSTICO ===');
    
    if (authenticated) {
      console.log('\n✅ Todo está funcionando correctamente');
    } else {
      console.log('\n⚠️ La conexión funciona pero necesitas iniciar sesión en /admin');
    }
  }
};

// Hacer disponible globalmente para la consola
if (typeof window !== 'undefined') {
  (window as any).supabaseDiagnostic = diagnostic;
  console.log('💡 Ejecuta window.supabaseDiagnostic.runFull() para diagnóstico completo');
}
