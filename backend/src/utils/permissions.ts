import db from '../config/database';
import { UserModel } from '../models/User';

export class PermissionService {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  async isAdmin(): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT activo FROM administradores WHERE id_usuario = ? AND activo = 1',
        [this.userId]
      );
      return result.length > 0;
    } catch (error) {
      console.error('Error checking admin permission:', error);
      return false;
    }
  }

  async isTecnico(): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT activo FROM tecnicos WHERE id_usuario = ? AND activo = 1',
        [this.userId]
      );
      return result.length > 0;
    } catch (error) {
      console.error('Error checking tecnico permission:', error);
      return false;
    }
  }

  async isAnalista(): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT activo FROM analistas WHERE id_usuario = ? AND activo = 1',
        [this.userId]
      );
      return result.length > 0;
    } catch (error) {
      console.error('Error checking analista permission:', error);
      return false;
    }
  }

  async isCoordinador(): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT activo FROM coordinadores WHERE id_usuario = ? AND activo = 1',
        [this.userId]
      );
      return result.length > 0;
    } catch (error) {
      console.error('Error checking coordinador permission:', error);
      return false;
    }
  }

  async isComercial(): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT activo FROM comerciales WHERE id_usuario = ? AND activo = 1',
        [this.userId]
      );
      return result.length > 0;
    } catch (error) {
      console.error('Error checking comercial permission:', error);
      return false;
    }
  }

  async getRelatedSedes(): Promise<number[]> {
    try {
      const result = await db.query(`
        SELECT * FROM (
          SELECT usuarios_vs_sedes.id_sede AS id_sede
          FROM usuarios_vs_sedes 
          WHERE usuarios_vs_sedes.activo = 1 AND usuarios_vs_sedes.id_usuario = ?
          UNION
          SELECT sedes.id AS id_sede
          FROM usuarios_vs_clientes 
          INNER JOIN sedes ON usuarios_vs_clientes.id_cliente = sedes.id_cliente 
          WHERE usuarios_vs_clientes.activo = 1 AND usuarios_vs_clientes.id_usuario = ?
        ) as TableA
      `, [this.userId, this.userId]);
      
      return result.map((row: any) => row.id_sede);
    } catch (error) {
      console.error('Error getting related sedes:', error);
      return [];
    }
  }

  async getRelatedClientes(): Promise<number[]> {
    try {
      const result = await db.query(`
        SELECT * FROM (
          SELECT sedes.id_cliente AS id_cliente
          FROM usuarios_vs_sedes 
          INNER JOIN sedes ON usuarios_vs_sedes.id_sede = sedes.id 
          WHERE usuarios_vs_sedes.activo = 1 AND usuarios_vs_sedes.id_usuario = ?
          UNION
          SELECT usuarios_vs_clientes.id_cliente AS id_cliente
          FROM usuarios_vs_clientes 
          WHERE usuarios_vs_clientes.activo = 1 AND usuarios_vs_clientes.id_usuario = ?
        ) as TableA
      `, [this.userId, this.userId]);
      
      return result.map((row: any) => row.id_cliente);
    } catch (error) {
      console.error('Error getting related clientes:', error);
      return [];
    }
  }

  async hasSedePermission(sedeId: number): Promise<boolean> {
    if (await this.isAdmin()) {
      return true;
    }
    
    const relatedSedes = await this.getRelatedSedes();
    return relatedSedes.includes(sedeId);
  }

  async hasClientePermission(clienteId: number): Promise<boolean> {
    if (await this.isAdmin()) {
      return true;
    }
    
    const relatedClientes = await this.getRelatedClientes();
    return relatedClientes.includes(clienteId);
  }

  async hasPagePermission(pageId: number): Promise<boolean> {
    if (await this.isAdmin()) {
      return true;
    }

    try {
      const pageResult = await db.query(
        'SELECT per_todos, per_analista, per_tecnico, per_coordinador, per_comercial FROM pages WHERE id = ?',
        [pageId]
      );

      if (pageResult.length === 0) {
        return false;
      }

      const page = pageResult[0];
      
      // Check role-based permissions
      if (page.per_coordinador === 1 && await this.isCoordinador()) return true;
      if (page.per_tecnico === 1 && await this.isTecnico()) return true;
      if (page.per_analista === 1 && await this.isAnalista()) return true;
      if (page.per_comercial === 1 && await this.isComercial()) return true;

      // Check special permissions
      const specialPermissions = await this.getSpecialPermissions();
      if (specialPermissions.includes(pageId)) return true;

      return page.per_todos === 1;
    } catch (error) {
      console.error('Error checking page permission:', error);
      return false;
    }
  }

  async getSpecialPermissions(): Promise<number[]> {
    try {
      const result = await db.query(
        'SELECT ids_paginas FROM permisos_especiales WHERE id_usuario = ? AND activo = 1',
        [this.userId]
      );
      
      const permissions: number[] = [];
      result.forEach((row: any) => {
        if (row.ids_paginas) {
          const pageIds = row.ids_paginas.split(',').map((id: string) => parseInt(id.trim()));
          permissions.push(...pageIds);
        }
      });
      
      return [...new Set(permissions)]; // Remove duplicates
    } catch (error) {
      console.error('Error getting special permissions:', error);
      return [];
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const user = await UserModel.findById(this.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const roles = await UserModel.getUserRoles(this.userId);
      
      return {
        ...user,
        roles,
        relatedSedes: await this.getRelatedSedes(),
        relatedClientes: await this.getRelatedClientes()
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Error al obtener información del usuario');
    }
  }
}