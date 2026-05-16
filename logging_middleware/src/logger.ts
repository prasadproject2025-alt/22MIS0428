import http from 'http';
import { URL } from 'url';

export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
export type PackageName = BackendPackage | FrontendPackage | SharedPackage;

const backendPackages: BackendPackage[] = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
];
const frontendPackages: FrontendPackage[] = ['api', 'component', 'hook', 'page', 'state', 'style'];
const sharedPackages: SharedPackage[] = ['auth', 'config', 'middleware', 'utils'];
const validStacks: Stack[] = ['backend', 'frontend'];
const validLevels: Level[] = ['debug', 'info', 'warn', 'error', 'fatal'];

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
  if (
    !backendPackages.includes(payload.package as BackendPackage) &&
    !frontendPackages.includes(payload.package as FrontendPackage) &&
    !sharedPackages.includes(payload.package as SharedPackage)
  ) {
    throw new Error(`Invalid package '${payload.package}'.`);
  }
  if (typeof payload.message !== 'string' || payload.message.length === 0) {
    throw new Error('Message must be a non-empty string.');
  }
}

function sendRemoteLog(payload: LogPayload) {
  const apiUrl = process.env.LOGGING_API_URL || 'http://4.224.186.213/evaluation-service/logs';
  const token = process.env.LOGGING_API_TOKEN;
  if (!token) {
    return;
  }

  const url = new URL(apiUrl);
  const body = JSON.stringify(payload);
  const options: http.RequestOptions = {
    hostname: url.hostname,
    port: Number(url.port) || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: `Bearer ${token}`,
    },
  };

  const request = http.request(options, (response) => {
    response.on('data', () => null);
    response.on('end', () => null);
  });

  request.on('error', () => null);
  request.write(body);
  request.end();
}

export function Log(stack: Stack, level: Level, pkg: PackageName, message: string) {
  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  validateLogPayload(payload);

  if (level === 'error' || level === 'fatal') {
    console.error(`[${stack}] [${level}] [${pkg}] ${message}`);
  } else if (level === 'warn') {
    console.warn(`[${stack}] [${level}] [${pkg}] ${message}`);
  } else {
    console.log(`[${stack}] [${level}] [${pkg}] ${message}`);
  }

  if (stack === 'backend') {
    sendRemoteLog(payload);
  }

  return payload;
}
