// Test simple para verificar el módulo de clientes
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testClientesModule() {
  console.log('🧪 Iniciando tests del módulo de Clientes...\n');
  
  try {
    // Test 1: Obtener estadísticas
    console.log('📊 Test 1: Obtener estadísticas de clientes');
    const statsResponse = await fetch(`${BASE_URL}/clientes/stats`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ Estadísticas obtenidas:', statsData.data);
    } else {
      console.log('❌ Error en estadísticas:', statsData);
    }
    
    // Test 2: Obtener lista de clientes
    console.log('\n📝 Test 2: Obtener lista de clientes');
    const listResponse = await fetch(`${BASE_URL}/clientes/public?limit=5`);
    const listData = await listResponse.json();
    
    if (listData.success) {
      console.log('✅ Lista de clientes obtenida:');
      console.log(`- Total clientes: ${listData.data.pagination.total}`);
      console.log(`- Clientes en respuesta: ${listData.data.clientes.length}`);
      listData.data.clientes.forEach((cliente, index) => {
        console.log(`  ${index + 1}. ${cliente.nombre} (${cliente.email})`);
      });
    } else {
      console.log('❌ Error en lista:', listData);
    }
    
    // Test 3: Buscar clientes
    console.log('\n🔍 Test 3: Buscar clientes por nombre');
    const searchResponse = await fetch(`${BASE_URL}/clientes/public?search=Clínica&limit=3`);
    const searchData = await searchResponse.json();
    
    if (searchData.success) {
      console.log('✅ Búsqueda completada:');
      console.log(`- Resultados encontrados: ${searchData.data.clientes.length}`);
      searchData.data.clientes.forEach((cliente, index) => {
        console.log(`  ${index + 1}. ${cliente.nombre}`);
      });
    } else {
      console.log('❌ Error en búsqueda:', searchData);
    }
    
    // Test 4: Obtener cliente específico (si existe al menos uno)
    if (listData.success && listData.data.clientes.length > 0) {
      const clienteId = listData.data.clientes[0].id;
      console.log(`\n👤 Test 4: Obtener cliente específico (ID: ${clienteId})`);
      
      const singleResponse = await fetch(`${BASE_URL}/clientes/public/${clienteId}`);
      const singleData = await singleResponse.json();
      
      if (singleData.success) {
        console.log('✅ Cliente obtenido:', {
          id: singleData.data.id,
          nombre: singleData.data.nombre,
          email: singleData.data.email,
          telefono: singleData.data.telefono,
          activo: singleData.data.activo === 1 ? 'Activo' : 'Inactivo'
        });
      } else {
        console.log('❌ Error obteniendo cliente específico:', singleData);
      }
    }
    
    console.log('\n🎉 Tests del módulo de Clientes completados!');
    
  } catch (error) {
    console.error('❌ Error en tests:', error.message);
  }
}

// Ejecutar tests
testClientesModule();