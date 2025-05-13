export class RedisKeys {
  
  static refreshSession(userId: string, sessionId: string): string {
    return `refresh:${userId}:${sessionId}`;
  }

  static sessionList(userId: string): string {
    return `sessions:${userId}`;
  }
}
