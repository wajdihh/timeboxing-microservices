import { createLogger,format, transports } from "winston";

export const winstonLogger = createLogger({
  level: "info",    // Log only if level is less than or equal to this level
  format: format.combine(   // Combine multiple formats into a single format
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),   // Add a timestamp to each log entry       
    format.json()         // Add a JSON object to each log entry        
  ),
  transports: [   // List of transports to which the log messages will be written
    new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),   // Log to the console
    new transports.File({ filename: 'error.log', level: 'error' }),   // Log to a file
    new transports.File({ filename: 'combined.log' })   // Log to another file
  ]
});