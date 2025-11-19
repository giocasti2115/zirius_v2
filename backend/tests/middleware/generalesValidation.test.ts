import { validateGeneralesPermissions, validateSystemVariablePermissions, sanitizeGeneralesInput } from '../src/middleware/generalesValidation';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
jest.mock('../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

jest.mock('../src/services/IntegracionGeneralesService', () => ({
  IntegracionGeneralesService: jest.fn().mockImplementation(() => ({
    getVariableSistema: jest.fn(),
    registrarEvento: jest.fn()
  }))
}));

describe('Generales Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: { id: 1, email: 'test@test.com', rol: 'ADMIN' },
      method: 'GET',
      originalUrl: '/api/generales/test',
      ip: '127.0.0.1',
      body: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();
  });

  describe('validateGeneralesPermissions', () => {
    it('should allow access for ADMIN users', async () => {
      const middleware = validateGeneralesPermissions('test.permission');
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for SUPER_ADMIN users', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'SUPER_ADMIN' };
      const middleware = validateGeneralesPermissions('test.permission');
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow access for COORDINADOR users', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'COORDINADOR' };
      const middleware = validateGeneralesPermissions('test.permission');
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access for unauthorized roles', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'TECNICO' };
      const middleware = validateGeneralesPermissions('test.permission');
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated users', async () => {
      mockRequest.user = null;
      const middleware = validateGeneralesPermissions('test.permission');
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('sanitizeGeneralesInput', () => {
    it('should sanitize HTML in body fields', () => {
      mockRequest.body = {
        nombre: '<script>alert("xss")</script>Test Name',
        descripcion: '<img src="x" onerror="alert(1)">Description'
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.nombre).not.toContain('<script>');
      expect(mockRequest.body.descripcion).not.toContain('<img');
      expect(mockRequest.body.nombre).toContain('Test Name');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should preserve allowed HTML in specific fields', () => {
      mockRequest.body = {
        contenido: '<p>This is <strong>allowed</strong> HTML</p>',
        nombre: '<script>alert("xss")</script>Not allowed here'
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      // contenido should preserve HTML (it's in allowedHtmlFields)
      expect(mockRequest.body.contenido).toContain('<p>');
      expect(mockRequest.body.contenido).toContain('<strong>');
      
      // nombre should be sanitized
      expect(mockRequest.body.nombre).not.toContain('<script>');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should remove control characters', () => {
      mockRequest.body = {
        nombre: 'Test\x00\x08\x0BName\x7F'
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.nombre).toBe('TestName');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize nested objects', () => {
      mockRequest.body = {
        data: {
          nombre: '<script>alert("nested")</script>Nested',
          config: {
            value: '<img src="x" onerror="alert(1)">Deep nested'
          }
        }
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.data.nombre).not.toContain('<script>');
      expect(mockRequest.body.data.config.value).not.toContain('<img');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize arrays', () => {
      mockRequest.body = {
        items: [
          '<script>alert("xss")</script>Item 1',
          '<img src="x" onerror="alert(1)">Item 2'
        ]
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.items[0]).not.toContain('<script>');
      expect(mockRequest.body.items[1]).not.toContain('<img');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      mockRequest.query = {
        search: '<script>alert("xss")</script>search term'
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.query.search).not.toContain('<script>');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle null and undefined values', () => {
      mockRequest.body = {
        nombre: null,
        descripcion: undefined,
        activo: false
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.nombre).toBeNull();
      expect(mockRequest.body.descripcion).toBeUndefined();
      expect(mockRequest.body.activo).toBe(false);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle empty objects and arrays', () => {
      mockRequest.body = {
        data: {},
        items: [],
        empty: ''
      };

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.data).toEqual({});
      expect(mockRequest.body.items).toEqual([]);
      expect(mockRequest.body.empty).toBe('');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateSystemVariablePermissions', () => {
    beforeEach(() => {
      // Mock IntegracionGeneralesService
      const { IntegracionGeneralesService } = require('../src/services/IntegracionGeneralesService');
      const mockService = new IntegracionGeneralesService();
      mockService.getVariableSistema.mockResolvedValue({
        id: 1,
        clave: 'test.variable',
        valor: 'test'
      });
    });

    it('should allow SUPER_ADMIN to modify critical variables', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'SUPER_ADMIN' };
      mockRequest.params = { id: '1' };
      
      const { IntegracionGeneralesService } = require('../src/services/IntegracionGeneralesService');
      const mockService = new IntegracionGeneralesService();
      mockService.getVariableSistema.mockResolvedValue({
        id: 1,
        clave: 'sistema.version',
        valor: '1.0'
      });

      await validateSystemVariablePermissions(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny non-SUPER_ADMIN access to critical variables', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'ADMIN' };
      mockRequest.params = { id: '1' };
      
      const { IntegracionGeneralesService } = require('../src/services/IntegracionGeneralesService');
      const mockService = new IntegracionGeneralesService();
      mockService.getVariableSistema.mockResolvedValue({
        id: 1,
        clave: 'respaldos.auto_enabled',
        valor: 'true'
      });

      await validateSystemVariablePermissions(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Solo los super administradores pueden modificar esta variable crítica'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow access to non-critical variables', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'ADMIN' };
      mockRequest.params = { id: '1' };
      
      const { IntegracionGeneralesService } = require('../src/services/IntegracionGeneralesService');
      const mockService = new IntegracionGeneralesService();
      mockService.getVariableSistema.mockResolvedValue({
        id: 1,
        clave: 'email.remitente_default',
        valor: 'test@test.com'
      });

      await validateSystemVariablePermissions(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle variable not found', async () => {
      mockRequest.user = { id: 1, email: 'test@test.com', rol: 'ADMIN' };
      mockRequest.params = { id: '999' };
      
      const { IntegracionGeneralesService } = require('../src/services/IntegracionGeneralesService');
      const mockService = new IntegracionGeneralesService();
      mockService.getVariableSistema.mockResolvedValue(null);

      await validateSystemVariablePermissions(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Variable no encontrada'
      });
    });

    it('should handle unauthenticated users', async () => {
      mockRequest.user = null;
      mockRequest.params = { id: '1' };

      await validateSystemVariablePermissions(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling in Middleware', () => {
    it('should handle errors in sanitizeGeneralesInput', () => {
      // Create a circular reference to cause JSON.stringify to fail
      const circular: any = {};
      circular.self = circular;
      mockRequest.body = circular;

      sanitizeGeneralesInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error procesando los datos de entrada'
      });
    });

    it('should handle errors in validateGeneralesPermissions', async () => {
      // Mock an error by making user property throw
      Object.defineProperty(mockRequest, 'user', {
        get: () => { throw new Error('Test error'); }
      });

      const middleware = validateGeneralesPermissions('test.permission');
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });
});