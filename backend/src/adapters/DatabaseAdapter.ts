// Adaptador para mapear entre esquemas de BD
// Este archivo traduce entre la estructura actual y la BD de producción

type TableMapping = {
  [key: string]: string;
}

type FieldMapping = {
  [tableName: string]: {
    [newField: string]: string;
  };
}

export class DatabaseAdapter {
  // Mapeo de nombres de tablas
  static tableMapping: TableMapping = {
    // Nuevo nombre -> Nombre en producción
    'users': 'usuarios',
    'clientes': 'clientes', // Asumiendo que ya existe
    'equipos': 'equipos',   // Asumiendo que ya existe
    'solicitudes': 'servicios', // Ejemplo
    'ordenes': 'ordenes_trabajo',
    'visitas': 'visitas_tecnicas',
    'cotizaciones': 'cotizaciones'
  }

  // Mapeo de nombres de campos
  static fieldMapping: FieldMapping = {
    'users': {
      'id': 'id_usuario',
      'email': 'correo_electronico',
      'password': 'clave',
      'role': 'tipo_usuario',
      'nombre': 'nombres',
      'apellido': 'apellidos',
      'created_at': 'fecha_creacion'
    },
    'solicitudes': {
      'tipo_solicitud': 'tipo_servicio',
      'cliente_id': 'id_cliente',
      'equipo_id': 'id_equipo',
      'estado': 'estado_solicitud'
    },
    'ordenes': {
      'tipo_orden': 'tipo_trabajo',
      'fecha_programada': 'fecha_programacion',
      'tecnico_asignado_id': 'id_tecnico'
    },
    'cotizaciones': {
      'monto_total': 'valor_total',
      'cliente_id': 'id_cliente_cotizacion'
    }
  }

  // Función para traducir consultas
  static translateQuery(query: string, tableName: string): string {
    let translatedQuery = query;
    
    // Traducir nombre de tabla
    if (this.tableMapping[tableName]) {
      translatedQuery = translatedQuery.replace(
        new RegExp(tableName, 'g'), 
        this.tableMapping[tableName]
      );
    }

    // Traducir nombres de campos
    const fieldMap = this.fieldMapping[tableName];
    if (fieldMap) {
      Object.entries(fieldMap).forEach(([newField, oldField]) => {
        translatedQuery = translatedQuery.replace(
          new RegExp(`\\b${newField}\\b`, 'g'),
          oldField
        );
      });
    }

    return translatedQuery;
  }

  // Función para traducir resultados de BD a formato esperado
  static translateResults(results: any[], tableName: string): any[] {
    const fieldMap = this.fieldMapping[tableName];
    if (!fieldMap) return results;

    return results.map(row => {
      const translatedRow: any = {};
      
      Object.entries(fieldMap).forEach(([newField, oldField]) => {
        if (row[oldField] !== undefined) {
          translatedRow[newField] = row[oldField];
        }
      });

      // Copiar campos que no necesitan traducción
      Object.keys(row).forEach(key => {
        if (!Object.values(fieldMap).includes(key)) {
          translatedRow[key] = row[key];
        }
      });

      return translatedRow;
    });
  }
}

export default DatabaseAdapter;