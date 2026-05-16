import { NextFunction, Request, Response } from 'express';
import { Log } from './logger';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    Log('backend', 'debug', 'middleware', `incoming request: ${req.method} ${req.originalUrl}`);
  } catch (error) {
    console.error('Logging middleware failed to start log', error);
  }

  const startedAt = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    try {
      Log(
        'backend',
        'info',
        'middleware',
        `request completed: ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`,
      );
    } catch (error) {
      console.error('Logging middleware failed to write completion log', error);
    }
  });

  next();
}

export { Log } from './logger';
