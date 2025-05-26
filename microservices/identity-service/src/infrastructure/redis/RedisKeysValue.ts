export class RedisKeys {
  
  //To manage session for refresh token
  static jtiSessionKey(jti: string) { return `refresh:jti:${jti}`; }
  static userSessionsKey(userId: string) { return `sessions:${userId}`; }
}
