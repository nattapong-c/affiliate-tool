import pino from 'pino';
import { FacebookSession } from '../types/scraper';
import { getRandomUserAgent } from '../config/stealth-config';

const logger = pino();

// Simple in-memory session storage (replace with database in production)
class SessionStorage {
  private sessions: Map<string, FacebookSession> = new Map();

  async save(session: FacebookSession): Promise<void> {
    this.sessions.set(session.userId, session);
    logger.info({ userId: session.userId }, 'Session saved');
  }

  async load(userId: string): Promise<FacebookSession | null> {
    const session = this.sessions.get(userId);
    if (session) {
      logger.info({ userId }, 'Session loaded');
    }
    return session || null;
  }

  async delete(userId: string): Promise<boolean> {
    const deleted = this.sessions.delete(userId);
    logger.info({ userId, deleted }, 'Session deleted');
    return deleted;
  }

  async list(): Promise<FacebookSession[]> {
    return Array.from(this.sessions.values());
  }

  async clear(): Promise<void> {
    this.sessions.clear();
    logger.info('All sessions cleared');
  }
}

export const sessionStorage = new SessionStorage();

/**
 * Session Manager for Facebook authentication
 */
export class SessionManager {
  /**
   * Create a new Facebook session from cookies
   */
  async createSession(
    userId: string,
    cookies: Array<{
      name: string;
      value: string;
      domain: string;
      path: string;
      expires?: number;
    }>,
    userAgent?: string
  ): Promise<FacebookSession> {
    const session: FacebookSession = {
      userId,
      cookies,
      userAgent: userAgent || getRandomUserAgent(),
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
    };

    await sessionStorage.save(session);
    logger.info({ userId }, 'Facebook session created');

    return session;
  }

  /**
   * Get session by user ID
   */
  async getSession(userId: string): Promise<FacebookSession | null> {
    return sessionStorage.load(userId);
  }

  /**
   * Update session last used timestamp
   */
  async touchSession(userId: string): Promise<void> {
    const session = await sessionStorage.load(userId);
    if (session) {
      session.lastUsed = new Date();
      await sessionStorage.save(session);
    }
  }

  /**
   * Deactivate a session
   */
  async deactivateSession(userId: string): Promise<void> {
    const session = await sessionStorage.load(userId);
    if (session) {
      session.isActive = false;
      await sessionStorage.save(session);
      logger.info({ userId }, 'Session deactivated');
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(userId: string): Promise<boolean> {
    return sessionStorage.delete(userId);
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<FacebookSession[]> {
    const sessions = await sessionStorage.list();
    return sessions.filter(s => s.isActive);
  }

  /**
   * Validate session cookies
   * Check if required Facebook cookies are present
   */
  validateCookies(cookies: Array<{ name: string; value: string }>): boolean {
    const requiredCookies = ['c_user', 'xs'];
    const cookieNames = cookies.map(c => c.name);

    const isValid = requiredCookies.every(name => cookieNames.includes(name));

    if (!isValid) {
      logger.warn(
        { missing: requiredCookies.filter(name => !cookieNames.includes(name)) },
        'Session cookies validation failed'
      );
    }

    return isValid;
  }

  /**
   * Export session to JSON (for backup/transfer)
   */
  exportSession(session: FacebookSession): string {
    return JSON.stringify(session, null, 2);
  }

  /**
   * Import session from JSON
   */
  async importSession(json: string): Promise<FacebookSession> {
    try {
      const session: FacebookSession = JSON.parse(json);
      
      // Validate required fields
      if (!session.userId || !session.cookies || !session.userAgent) {
        throw new Error('Invalid session format');
      }

      await sessionStorage.save(session);
      logger.info({ userId: session.userId }, 'Session imported');

      return session;
    } catch (error) {
      logger.error({ error }, 'Failed to import session');
      throw new Error('Invalid session JSON');
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const sessions = await sessionStorage.list();
    const now = Date.now();
    let cleaned = 0;

    for (const session of sessions) {
      const age = now - session.lastUsed.getTime();
      if (age > maxAge) {
        await this.deleteSession(session.userId);
        cleaned++;
      }
    }

    logger.info({ cleaned }, 'Session cleanup complete');
    return cleaned;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
