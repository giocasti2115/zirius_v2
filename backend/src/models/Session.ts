import jwt from 'jsonwebtoken';
import db from '../config/database';
import { Session } from './types';

export class SessionModel {
  
  static async createSession(userId: number): Promise<{ sessionId: number; token: string }> {
    try {
      // Create session record in database (compatible with PHP system)
      const result = await db.query(
        'INSERT INTO sesiones (id_usuario) VALUES (?)',
        [userId]
      );
      
      const sessionId = result.insertId;
      
      // Generate JWT token for API authentication
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      const payload = { 
        userId, 
        sessionId,
        iat: Math.floor(Date.now() / 1000)
      };
      const options: any = { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
      };
      
      const token = jwt.sign(payload, jwtSecret, options);

      return { sessionId, token };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Error al crear sesión');
    }
  }

  static async validateSession(sessionId: number): Promise<Session | null> {
    try {
      const sessions = await db.query(
        'SELECT * FROM sesiones WHERE id = ?',
        [sessionId]
      );
      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }

  static async deleteSession(sessionId: number): Promise<boolean> {
    try {
      await db.query('DELETE FROM sesiones WHERE id = ?', [sessionId]);
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  static async deleteUserSessions(userId: number): Promise<boolean> {
    try {
      await db.query('DELETE FROM sesiones WHERE id_usuario = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Error deleting user sessions:', error);
      return false;
    }
  }

  static async cleanExpiredSessions(): Promise<void> {
    try {
      // Clean sessions older than 5 days (similar to PHP logic)
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      await db.query(
        'DELETE FROM sesiones WHERE created_at < ?',
        [fiveDaysAgo.toISOString().split('T')[0]]
      );
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  }

  static verifyJWTToken(token: string): any {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      return null;
    }
  }
}