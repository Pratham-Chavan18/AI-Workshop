import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: {
    paths: ['req.body.email', 'req.body.phone', 'body.email', 'body.phone', 'email', 'phone', '*.email', '*.phone'],
    censor: '[REDACTED]',
  },
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export const httpLogger = pinoHttp({
  logger: logger as any,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
});
