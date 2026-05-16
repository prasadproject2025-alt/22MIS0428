export type Stack = 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
export type PackageName = FrontendPackage | SharedPackage;

const validStacks: Stack[] = ['frontend'];
const validLevels: Level[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const validPackages: PackageName[] = ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'];

export interface LogPayload {
  stack: Stack;
  level: Level;
  package: PackageName;
  message: string;
}

function validateLogPayload(payload: LogPayload) {
  if (!validStacks.includes(payload.stack)) {
    throw new Error(`Invalid stack '${payload.stack}', expected ${validStacks.join(', ')}`);
  }
  if (!validLevels.includes(payload.level)) {
    throw new Error(`Invalid level '${payload.level}', expected ${validLevels.join(', ')}`);
  }
  if (!validPackages.includes(payload.package)) {
    throw new Error(`Invalid package '${payload.package}', expected one of ${validPackages.join(', ')}`);
  }
  if (typeof payload.message !== 'string' || payload.message.length === 0) {
    throw new Error('Message must be a non-empty string.');
  }
}

function sendRemoteLog(payload: LogPayload) {
  const token = import.meta.env.VITE_LOGGING_API_TOKEN;
  const apiUrl = import.meta.env.VITE_LOGGING_API_URL || 'http://4.224.186.213/evaluation-service/logs';

  if (!token) {
    return;
  }

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => null);
}

export function Log(stack: Stack, level: Level, pkg: PackageName, message: string) {
  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  validateLogPayload(payload);

  if (level === 'fatal' || level === 'error') {
    console.error(`[${stack}] [${level}] [${pkg}] ${message}`);
  } else if (level === 'warn') {
    console.warn(`[${stack}] [${level}] [${pkg}] ${message}`);
  } else {
    console.log(`[${stack}] [${level}] [${pkg}] ${message}`);
  }

  sendRemoteLog(payload);

  return payload;
}
