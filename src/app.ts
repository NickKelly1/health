import express, { ErrorRequestHandler, NextFunction, Response, Request, Handler, Express, } from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import httpErrors, { HttpError } from 'http-errors';
import isoFetch from 'isomorphic-fetch';
import { EnvSingleton } from './common/singletons/env.singleton';
import path from 'path';
import fs from 'fs';
import { logger, loggerStream } from './common/singletons/logger.singleton';
import { prettyQ } from './common/helpers/pretty.helper';

const defaults = {
  cross: path.normalize(path.join(EnvSingleton.DIR_ICONS, './cross.png')),
  tick: path.normalize(path.join(EnvSingleton.DIR_ICONS, './tick.png')),
}

enum IconType { fs = 'fs', url = 'url', };
type Icon = { type: IconType, value: string };

const handleIcon = (icon: Icon): Handler => (req, res, next): void => {
  switch (icon.type) {
    case IconType.fs: return void fs
      .createReadStream(icon.value)
      .pipe(res.status(200))
      .on('error', next)
    case IconType.url: return void res.redirect(icon.value)
    default: throw new httpErrors.InternalServerError();
  }
};

export async function setup(app: Express): Promise<Express> {
  // app.use('*', (req, res) => res.json({ hi: 'work', }));
  // log access
  app.use(morgan('dev', { stream: loggerStream }) as Handler);
  // rate limit
  app.use(rateLimit({
    windowMs: EnvSingleton.RATE_LIMIT_WINDOW_MS,
    max: EnvSingleton.RATE_LIMIT_MAX,
  }));
  // gzip
  app.use(compression());
  // any cors
  app.use(cors() as Handler)
  // serve public
  app.use(express.static(EnvSingleton.DIR_PUBLIC, { extensions: ['html'], }));

  // endpoint
  app.get('/check', (req, res, next) => (async () => {
    const url = req.query.url;
    if (!url) {  throw new httpErrors.BadRequest('No url given');  }
    if (typeof url !== 'string') { throw new httpErrors.BadRequest('No url or bad url given'); }
    let ifOkay: Icon = { type: IconType.fs, value: defaults.tick };
    let ifBad: Icon = { type: IconType.fs, value: defaults.cross };
    if (typeof req.query.okay === 'string'){ ifOkay = { type: IconType.url, value: req.query.okay, }; }
    if (typeof req.query.bad === 'string'){ ifBad = { type: IconType.url, value: req.query.bad, }; }
    logger.info(`[${url}] Checking...`);
    try {
      const result = await isoFetch(url, { method: 'GET' });
      switch (result.ok) {
        case true: {
          logger.info(`[${url}] Success: ${prettyQ(ifOkay)}`);
          return void handleIcon(ifOkay)(req, res, next);
        }
        case false: {
          logger.info(`[${url}] Fail: ${prettyQ(ifOkay)}`);
          return void handleIcon(ifBad)(req, res, next);
        }
        default: throw new httpErrors.InternalServerError();
      }
    } catch (err) {
      logger.warn(`[${url}] Errored: ${prettyQ(err)}`);
      throw err;
    }
  })().catch(next));

  app.use(function (err, req, res, next) {
    logger.error(`Error: ${prettyQ(err)}`);
    const _err = err instanceof HttpError ? err : new httpErrors.InternalServerError();
    res.status(_err.status).json(_err); 
  } as ErrorRequestHandler);

  return app;
}
