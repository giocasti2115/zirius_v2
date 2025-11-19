// Test script para verificar login desde frontend
async function testLogin() {
  try {
    const response = await fetch('http://localhost:3002/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        clave: '2743956'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Login exitoso');
      console.log('Token:', data.data?.token?.substring(0, 50) + '...');
      console.log('Usuario:', data.data?.user?.nombre);
    } else {
      console.log('❌ Login falló:', data.message);
    }
  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testLogin();