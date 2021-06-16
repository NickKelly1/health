import { Express } from 'express';
import { Config } from "../src/config";
import path from 'path';
import { setupLogger, teardownLogger } from "../src/logger";
import { middleware } from '../src/middleware';
import { routing } from '../src/routing';
import { createApp } from '../src/utils/create-app';
import net from 'net';

export const mockConfig = new Config({
  CACHE_VIEWS: false,
  NODE_ENV: 'testing',
  PORT: 3001,
  LOG_DIR: path.normalize(path.join('.', 'storage', 'logs', 'test')),
  LOG_MAX_SIZE: '20m',
  LOG_ROTATION_MAX_AGE: '2d',
  RATE_LIMIT_MAX: 10000,
  RATE_LIMIT_WINDOW_MS: 5,
});

export function createMockApp(): Express {
  const app = createApp(mockConfig);
  middleware(app);
  routing(app);
  return app;
}

export function jescribe(description: string, fn: jest.EmptyFunction) {
  return describe(description, function () {
    beforeAll(function globalBeforeAll() {
      setupLogger(mockConfig, true);
    })
    afterAll(function globalAfterAll() {
      teardownLogger();
    });

    fn();
  });
}

/**
 * Create a url given an address from nodejs
 *
 * @param address 
 */
export function createUrl(address: string | net.AddressInfo) {
  // check our own _health endpoint
  let targetUrl: URL;
  if (typeof address === 'string') {
    targetUrl = new URL(address);
  }
  else {
    if (net.isIPv6(address.address)) {
      targetUrl = new URL(`http://[${address.address}]:${address.port}`);
    }
    else if (net.isIPv4(address.address)) {
      targetUrl = new URL(`http://${address.address}:${address.port}`);
    }
    else {
      targetUrl = new URL(`http://${address.address}:${address.port}`);
    }
  }

  return targetUrl;
}