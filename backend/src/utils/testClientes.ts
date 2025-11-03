// Datos de prueba para el desarrollo - clientes mock
// En producción estos vendrán de la base de datos

export const TEST_CLIENTES = [
  {
    id: 1,
    nombre: "Clínica Dental Sonrisa",
    documento: "123456789",
    telefono: "555-0101",
    email: "contacto@sonrisa.com",
    direccion: "Av. Principal 123, Bogotá",
    activo: 1
  },
  {
    id: 2,
    nombre: "Centro Odontológico Vida",
    documento: "987654321",
    telefono: "555-0102",
    email: "info@vida.com",
    direccion: "Calle 45 #12-34, Medellín",
    activo: 1
  },
  {
    id: 3,
    nombre: "Consultorio Dr. García",
    documento: "456789123",
    telefono: "555-0103",
    email: "dr.garcia@email.com",
    direccion: "Carrera 7 #89-12, Cali",
    activo: 1
  },
  {
    id: 4,
    nombre: "Dental Care Plus",
    documento: "321654987",
    telefono: "555-0104",
    email: "admin@dentalcare.com",
    direccion: "Zona Rosa, Local 45, Barranquilla",
    activo: 1
  },
  {
    id: 5,
    nombre: "Ortodoncia Especializada",
    documento: "654321789",
    telefono: "555-0105",
    email: "contacto@orto.com",
    direccion: "Centro Comercial Norte, Piso 3",
    activo: 1
  }
];

export function findClienteById(id: number) {
  return TEST_CLIENTES.find(cliente => cliente.id === id && cliente.activo === 1);
}

export function searchClientes(search: string = '', page: number = 1, limit: number = 10) {
  let filtered = TEST_CLIENTES.filter(cliente => cliente.activo === 1);
  
  if (search) {
    const searchTerm = search.toLowerCase();
    filtered = filtered.filter(cliente => 
      cliente.nombre.toLowerCase().includes(searchTerm) ||
      cliente.documento.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm)
    );
  }
  
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const clientes = filtered.slice(startIndex, endIndex);
  
  return {
    clientes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}