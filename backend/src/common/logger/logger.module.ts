import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: isDevelopment ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        isDevelopment
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} [${context || 'App'}] ${level}: ${message} ${metaStr}`;
              }),
            )
          : winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        ...(isDevelopment
          ? []
          : [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
              }),
            ]),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
