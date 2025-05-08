import { JwtModuleOptions } from "@nestjs/jwt";
import { JwtConfigService } from "./JwtConfigService";

export const JwtOptionsFactory = (config: JwtConfigService): JwtModuleOptions => ({
    secret: config.getAccessSecret(),
    signOptions: {
      expiresIn: config.getAccessExpiresIn(),
    },
  });