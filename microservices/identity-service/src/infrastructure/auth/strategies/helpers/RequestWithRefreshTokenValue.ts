import { Request } from 'express';
export interface RequestWithRefreshTokenValue extends Request {
  refreshToken: string; 
}
