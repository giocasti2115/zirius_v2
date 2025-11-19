import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/database';
import jwt from 'jsonwebtoken';

describe('Generales API', () => {
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Setup test database connection
    await db.authenticate();
    
    // Create test user and get auth token
    const testUser = {
      id: 1,
      email: 'test@zirius.com',
      rol: 'ADMIN'
    };
    
    authToken = jwt.sign(testUser, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    });
    
    testUserId = testUser.id;
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Tipos de Equipos', () => {
    describe('GET /api/generales/tipos-equipos', () => {
      it('should return list of tipos de equipos with valid auth', async () => {
        const response = await request(app)
          .get('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('items');
        expect(response.body.data).toHaveProperty('pagination');
      });

      it('should return 401 without auth token', async () => {
        await request(app)
          .get('/api/generales/tipos-equipos')
          .expect(401);
      });

      it('should handle pagination parameters', async () => {
        const response = await request(app)
          .get('/api/generales/tipos-equipos?page=1&limit=10')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.pagination).toHaveProperty('page', 1);
        expect(response.body.data.pagination).toHaveProperty('limit', 10);
      });

      it('should handle search parameter', async () => {
        const response = await request(app)
          .get('/api/generales/tipos-equipos?search=monitor')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
      });

      it('should validate pagination parameters', async () => {
        await request(app)
          .get('/api/generales/tipos-equipos?page=0')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        await request(app)
          .get('/api/generales/tipos-equipos?limit=101')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);
      });
    });

    describe('POST /api/generales/tipos-equipos', () => {
      it('should create new tipo de equipo with valid data', async () => {
        const newTipoEquipo = {
          nombre: 'Monitor de Signos Vitales Test',
          descripcion: 'Monitor para pruebas unitarias',
          categoria: 'BIOMEDICO',
          requiere_calibracion: true,
          vida_util_anos: 10
        };

        const response = await request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newTipoEquipo)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.nombre).toBe(newTipoEquipo.nombre);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          descripcion: 'Sin nombre'
        };

        const response = await request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('errors');
      });

      it('should validate categoria enum', async () => {
        const invalidData = {
          nombre: 'Test Invalid Category',
          categoria: 'INVALID_CATEGORY'
        };

        await request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should sanitize input data', async () => {
        const dataWithScript = {
          nombre: 'Test <script>alert("xss")</script>',
          descripcion: 'Descripción con <script>alert("xss")</script>',
          categoria: 'BIOMEDICO'
        };

        const response = await request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(dataWithScript)
          .expect(201);

        expect(response.body.data.nombre).not.toContain('<script>');
        expect(response.body.data.descripcion).not.toContain('<script>');
      });
    });

    describe('PUT /api/generales/tipos-equipos/:id', () => {
      let tipoEquipoId: number;

      beforeEach(async () => {
        // Create a test tipo equipo
        const response = await request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            nombre: 'Test Tipo for Update',
            categoria: 'BIOMEDICO'
          });
        
        tipoEquipoId = response.body.data.id;
      });

      it('should update existing tipo de equipo', async () => {
        const updateData = {
          nombre: 'Updated Test Tipo',
          descripcion: 'Updated description'
        };

        const response = await request(app)
          .put(`/api/generales/tipos-equipos/${tipoEquipoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.nombre).toBe(updateData.nombre);
      });

      it('should return 404 for non-existent id', async () => {
        await request(app)
          .put('/api/generales/tipos-equipos/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ nombre: 'Test' })
          .expect(404);
      });

      it('should validate id parameter', async () => {
        await request(app)
          .put('/api/generales/tipos-equipos/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ nombre: 'Test' })
          .expect(400);
      });
    });

    describe('DELETE /api/generales/tipos-equipos/:id', () => {
      let tipoEquipoId: number;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            nombre: 'Test Tipo for Delete',
            categoria: 'BIOMEDICO'
          });
        
        tipoEquipoId = response.body.data.id;
      });

      it('should delete existing tipo de equipo', async () => {
        await request(app)
          .delete(`/api/generales/tipos-equipos/${tipoEquipoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .get(`/api/generales/tipos-equipos/${tipoEquipoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should return 404 for non-existent id', async () => {
        await request(app)
          .delete('/api/generales/tipos-equipos/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });
  });

  describe('Marcas', () => {
    describe('GET /api/generales/marcas', () => {
      it('should return list of marcas', async () => {
        const response = await request(app)
          .get('/api/generales/marcas')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      });
    });

    describe('POST /api/generales/marcas', () => {
      it('should create new marca with valid data', async () => {
        const newMarca = {
          nombre: 'Philips Healthcare Test',
          descripcion: 'Marca de prueba',
          pais_origen: 'Países Bajos',
          sitio_web: 'https://www.philips.com'
        };

        const response = await request(app)
          .post('/api/generales/marcas')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newMarca)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.nombre).toBe(newMarca.nombre);
      });

      it('should validate URL format for sitio_web', async () => {
        const invalidData = {
          nombre: 'Test Marca',
          sitio_web: 'invalid-url'
        };

        await request(app)
          .post('/api/generales/marcas')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });
    });
  });

  describe('Estados', () => {
    describe('POST /api/generales/estados', () => {
      it('should create new estado with valid data', async () => {
        const newEstado = {
          nombre: 'En Prueba',
          descripcion: 'Estado para pruebas unitarias',
          color: '#FF5733',
          tipo: 'EQUIPO',
          es_final: false,
          permite_edicion: true,
          orden: 1
        };

        const response = await request(app)
          .post('/api/generales/estados')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newEstado)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.color).toBe(newEstado.color);
      });

      it('should validate color format', async () => {
        const invalidData = {
          nombre: 'Test Estado',
          color: 'invalid-color',
          tipo: 'EQUIPO'
        };

        await request(app)
          .post('/api/generales/estados')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should validate tipo enum', async () => {
        const invalidData = {
          nombre: 'Test Estado',
          color: '#FF5733',
          tipo: 'INVALID_TIPO'
        };

        await request(app)
          .post('/api/generales/estados')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });
    });
  });

  describe('Variables del Sistema', () => {
    describe('GET /api/generales/variables-sistema', () => {
      it('should return system variables', async () => {
        const response = await request(app)
          .get('/api/generales/variables-sistema')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
      });

      it('should filter by categoria', async () => {
        const response = await request(app)
          .get('/api/generales/variables-sistema?categoria=sistema')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
      });
    });

    describe('POST /api/generales/variables-sistema', () => {
      it('should create new variable with valid data', async () => {
        const newVariable = {
          clave: 'test.variable.unit',
          valor: 'test-value',
          descripcion: 'Variable de prueba para tests unitarios',
          tipo: 'string',
          categoria: 'sistema',
          es_publica: true,
          modificable: true
        };

        const response = await request(app)
          .post('/api/generales/variables-sistema')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newVariable)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.clave).toBe(newVariable.clave);
      });

      it('should validate clave format', async () => {
        const invalidData = {
          clave: 'INVALID-KEY-FORMAT',
          valor: 'test',
          descripcion: 'Test description',
          tipo: 'string',
          categoria: 'sistema'
        };

        await request(app)
          .post('/api/generales/variables-sistema')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          clave: 'test.key'
          // Missing required fields
        };

        const response = await request(app)
          .post('/api/generales/variables-sistema')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on create operations', async () => {
      const testData = {
        nombre: 'Rate Limit Test',
        categoria: 'BIOMEDICO'
      };

      // Make many requests quickly to trigger rate limit
      const promises = Array(60).fill(null).map((_, i) => 
        request(app)
          .post('/api/generales/tipos-equipos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ...testData, nombre: `${testData.nombre} ${i}` })
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML in input fields', async () => {
      const maliciousData = {
        nombre: '<script>alert("xss")</script>Test Name',
        descripcion: '<img src="x" onerror="alert(\'xss\')"">Description',
        categoria: 'BIOMEDICO'
      };

      const response = await request(app)
        .post('/api/generales/tipos-equipos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousData)
        .expect(201);

      expect(response.body.data.nombre).not.toContain('<script>');
      expect(response.body.data.descripcion).not.toContain('<img');
      expect(response.body.data.nombre).toContain('Test Name');
    });

    it('should remove control characters', async () => {
      const dataWithControlChars = {
        nombre: 'Test\x00\x08\x0BName',
        categoria: 'BIOMEDICO'
      };

      const response = await request(app)
        .post('/api/generales/tipos-equipos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dataWithControlChars)
        .expect(201);

      expect(response.body.data.nombre).toBe('TestName');
    });
  });

  describe('Error Handling', () => {
    it('should handle database constraint violations', async () => {
      // Create first record
      const data = {
        nombre: 'Unique Name Test',
        categoria: 'BIOMEDICO'
      };

      await request(app)
        .post('/api/generales/tipos-equipos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data)
        .expect(201);

      // Try to create duplicate (should fail with unique constraint)
      const response = await request(app)
        .post('/api/generales/tipos-equipos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Ya existe un registro');
    });

    it('should handle invalid JSON in request body', async () => {
      await request(app)
        .post('/api/generales/tipos-equipos')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('Audit Logging', () => {
    it('should log all modification operations', async () => {
      const testData = {
        nombre: 'Audit Test',
        categoria: 'BIOMEDICO'
      };

      // Create operation should be logged
      const createResponse = await request(app)
        .post('/api/generales/tipos-equipos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(201);

      const id = createResponse.body.data.id;

      // Update operation should be logged
      await request(app)
        .put(`/api/generales/tipos-equipos/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'Updated Audit Test' })
        .expect(200);

      // Delete operation should be logged
      await request(app)
        .delete(`/api/generales/tipos-equipos/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify logs were created (this would require checking the logs table)
      // For now, we just verify the operations completed successfully
    });
  });
});