import bcrypt from 'bcryptjs';
import db from '../config/database';
import { User, Session } from './types';

export class UserModel {
  
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const users = await db.query(
        'SELECT * FROM usuarios WHERE usuario = ? AND activo = 1',
        [username]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Error al buscar usuario');
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      const users = await db.query(
        'SELECT * FROM usuarios WHERE id = ? AND activo = 1',
        [id]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Error al buscar usuario por ID');
    }
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // For migration compatibility - check if password is already hashed or plain text
    if (plainPassword === hashedPassword) {
      return true; // PHP system uses plain text passwords (should be migrated)
    }
    
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async createUser(userData: Partial<User>): Promise<number> {
    const { usuario, clave, nombre, email } = userData;
    
    if (!usuario || !clave || !nombre) {
      throw new Error('Usuario, clave y nombre son requeridos');
    }

    const hashedPassword = await this.hashPassword(clave);
    
    try {
      const result = await db.query(
        'INSERT INTO usuarios (usuario, clave, nombre, email, activo) VALUES (?, ?, ?, ?, 1)',
        [usuario, hashedPassword, nombre, email || null]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error al crear usuario');
    }
  }

  static async updateUser(id: number, userData: Partial<User>): Promise<boolean> {
    const { usuario, nombre, email } = userData;
    
    try {
      await db.query(
        'UPDATE usuarios SET usuario = ?, nombre = ?, email = ? WHERE id = ?',
        [usuario, nombre, email || null, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Error al actualizar usuario');
    }
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(newPassword);
    
    try {
      await db.query(
        'UPDATE usuarios SET clave = ? WHERE id = ?',
        [hashedPassword, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Error al actualizar contraseña');
    }
  }

  static async getUserRoles(userId: number): Promise<string[]> {
    const roles: string[] = [];
    
    try {
      // Check admin role
      const adminCheck = await db.query(
        'SELECT activo FROM administradores WHERE id_usuario = ? AND activo = 1',
        [userId]
      );
      if (adminCheck.length > 0) roles.push('admin');

      // Check tecnico role
      const tecnicoCheck = await db.query(
        'SELECT activo FROM tecnicos WHERE id_usuario = ? AND activo = 1',
        [userId]
      );
      if (tecnicoCheck.length > 0) roles.push('tecnico');

      // Check analista role
      const analistaCheck = await db.query(
        'SELECT activo FROM analistas WHERE id_usuario = ? AND activo = 1',
        [userId]
      );
      if (analistaCheck.length > 0) roles.push('analista');

      // Check coordinador role
      const coordinadorCheck = await db.query(
        'SELECT activo FROM coordinadores WHERE id_usuario = ? AND activo = 1',
        [userId]
      );
      if (coordinadorCheck.length > 0) roles.push('coordinador');

      // Check comercial role
      const comercialCheck = await db.query(
        'SELECT activo FROM comerciales WHERE id_usuario = ? AND activo = 1',
        [userId]
      );
      if (comercialCheck.length > 0) roles.push('comercial');

      return roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      throw new Error('Error al obtener roles del usuario');
    }
  }
}