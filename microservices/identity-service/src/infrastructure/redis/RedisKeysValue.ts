export class RedisKeys {
  
  //To manage session for refresh token
  static sessionKey(sessionId: string) { return `session:${sessionId}`; }
  static userSessionsKey(userId: string) { return `user:${userId}:sessions`; }
}
