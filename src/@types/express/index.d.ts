import winston from "winston";
import * as core from 'express-serve-static-core';
import { Config } from "../../config";
import { RequestLogger } from "../../utils/request-logger";
import { Server } from 'http';

declare global {
  namespace Express {
    interface Request {
      config: Config;
      log: RequestLogger;
    }

    interface Application {
      config: Config;
      server: Server;
      stop(this: core.Express, cb?: (() => any)): Promise<void>;
      start(this: core.Express, cb?: (() => any)): Promise<void>
      getPort(this: core.Express): number;
    }
  }
}
