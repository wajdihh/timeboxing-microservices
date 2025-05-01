//TODO create logger based on the ADR
import { createLogger, format, transports } from 'winston';

export const Logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});
