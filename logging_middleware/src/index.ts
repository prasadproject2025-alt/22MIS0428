import { NextFunction, Request, Response } from 'express';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(
      `[Request] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
}
