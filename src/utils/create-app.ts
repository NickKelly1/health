import express, { Express } from "express";
import http from 'http';
import { Config } from "../config";
import { logger } from "../logger";
import { expressAsync } from "./express-async";
import { noOverride } from "./no-override";
import { RequestLogger } from "./request-logger";

const MAX_ATTEMPTS = 3;
const ATTEMPT_RETRY_MS = 1000;


/**
 * Create an Express app
 *
 * @param config
 */
export function createApp(config: Config): Express {
  const app: Express = express();
  expressAsync(app);

  noOverride(
    app,
    'start',
    async function start(cb) {
      if (app.server.listening) {
        cb?.();
        return;
      }

      // try n times
      let success = false;
      let attempts = 0;
      // continue until either successful or exceeded attempts
      // keep going if not successful and under 3 attempts
      while (!success) {
        attempts += 1;
        if (attempts > 1) { await new Promise(res => setTimeout(res, ATTEMPT_RETRY_MS)); }
        success = await new Promise<boolean>((res) => {
          const onError = (error: Error) => {
            this.server.off('error', onError);
            this.server.off('listening', onListening);
            if (attempts < MAX_ATTEMPTS) return res(false);

            // critical error - full exit
            if ((error as any).syscall !== 'listen') {
              throw error;
            }

            const bind = typeof app.getPort() === 'string'
              ? 'Pipe ' + app.getPort()
              : 'Port ' + app.getPort();

            // handle specific listen errors with friendly messages
            switch ((error as any).code) {
              case 'EACCES':
                logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
              case 'EADDRINUSE':
                logger.error(bind + ' is already in use');
                process.exit(1);
                break;
              default:
            }

            throw error;
          }
          const onListening = () => {
            this.server.off('error', onError);
            this.server.off('listening', onListening);
            res(true);
          }
          this.server.once('error', onError);
          this.server.once('listening', onListening);
          this.server.listen(this.getPort());
        });
      }

      cb?.();
    }
  );

  noOverride(
    app,
    'stop',
    function stop(cb) {
      return new Promise<undefined>((res, rej) => this
        .server
        .close((err) => err ? rej(err) : res(undefined)))
        .then(() => logger.debug('server closed'))
        .then(() => void cb?.());
    },
  );

  noOverride(
    app,
    'getPort',
    function getPort() {
      return this.get('port');
    },
  );

  // create server
  const server: http.Server = http.createServer(app);

  app.config = config;
  app.server = server;
  app.set('port', config.PORT);
  app.set('view-engine', 'ejs');
  if (config.CACHE_VIEWS) app.enable('view cache');
  else app.disable('view cache');
  app.locals.VER = config.VER;

  app.use((req, res, next) => {
    req.config = app.config;
    req.log = new RequestLogger(logger, { prefix: req.ip });
    next();
  });

  server.on('listening', function onListening() {
    const port = app.getPort();
    const addr = server.address();
    if (addr === null) throw new Error('No address');
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr
      : 'pipe ' + addr.port;
    logger.debug(`Listening on ${bind}`);
  });

  return app;
}