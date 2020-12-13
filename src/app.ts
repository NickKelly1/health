import express, { ErrorRequestHandler, NextFunction, Response, Request, Handler, Express, query, } from 'express';
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
  cross_xxl: path.normalize(path.join(EnvSingleton.DIR_ICONS, './cross_100x100.png')),
  cross_xl: path.normalize(path.join(EnvSingleton.DIR_ICONS, './cross_64x64.png')),
  cross_l: path.normalize(path.join(EnvSingleton.DIR_ICONS, './cross_32x32.png')),
  cross_m: path.normalize(path.join(EnvSingleton.DIR_ICONS, './cross_16x16.png')),
  cross_sm: path.normalize(path.join(EnvSingleton.DIR_ICONS, './cross_8x8.png')),
  tick_xxl: path.normalize(path.join(EnvSingleton.DIR_ICONS, './tick_100x100.png')),
  tick_xl: path.normalize(path.join(EnvSingleton.DIR_ICONS, './tick_64x64.png')),
  tick_l: path.normalize(path.join(EnvSingleton.DIR_ICONS, './tick_32x32.png')),
  tick_m: path.normalize(path.join(EnvSingleton.DIR_ICONS, './tick_16x16.png')),
  tick_sm: path.normalize(path.join(EnvSingleton.DIR_ICONS, './tick_8x8.png')),
}

const Size = {
  xxl: 'xxl',
  xl: 'xl',
  l: 'l',
  m: 'm',
  sm: 'sm',
} as const;

enum IconType { fs = 'fs', url = 'url', };
type Icon = { type: IconType, value: string };

const handleIcon = (icon: Icon): Handler => (req, res, next): void => {
  switch (icon.type) {
    case IconType.fs: return res.sendFile(icon.value);
    case IconType.url: return void res.redirect(icon.value)
    default: throw new httpErrors.InternalServerError();
  }
};

export async function setup(app: Express): Promise<Express> {
  // log access
  app.use(morgan('dev', { stream: loggerStream }) as Handler);
  // any cors
  app.use(cors() as Handler)
  // rate limit
  app.use(rateLimit({
    windowMs: EnvSingleton.RATE_LIMIT_WINDOW_MS,
    max: EnvSingleton.RATE_LIMIT_MAX,
  }));
  // gzip
  app.use(compression());
  // serve public
  app.use(express.static(EnvSingleton.DIR_PUBLIC, { extensions: ['html'], }));

  // endpoint
  app.get('/check', (req, res, next) => (async () => {
    const url = req.query.url;
    if (!url) {  throw new httpErrors.BadRequest('No url given');  }
    if (typeof url !== 'string') { throw new httpErrors.BadRequest('No url or bad url given'); }
    let ifOkay: Icon = {
      type: IconType.fs,
      value: req.query.size === Size.xxl ? defaults.tick_xxl
        : req.query.size === Size.xl ? defaults.tick_xl
        : req.query.size === Size.l ? defaults.tick_l
        : req.query.size === Size.m ? defaults.tick_m
        : req.query.size === Size.sm ? defaults.tick_sm
        : defaults.tick_m
    };
    let ifBad: Icon = {
      type: IconType.fs,
      value: req.query.size === Size.xxl ? defaults.cross_xxl
        : req.query.size === Size.xl ? defaults.cross_xl
        : req.query.size === Size.l ? defaults.cross_l
        : req.query.size === Size.m ? defaults.cross_m
        : req.query.size === Size.sm ? defaults.cross_sm
        : defaults.cross_m
    };

    // okay
    if (typeof req.query.okay === 'string') { ifOkay = { type: IconType.url, value: req.query.okay, }; }

    // bad
    if (typeof req.query.bad === 'string') { ifBad = { type: IconType.url, value: req.query.bad, }; }

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

    // health check
  app.get('/_health', (req, res) => res.status(200).json({
    message: 'Okay :)',
    date: new Date().toISOString(),
  }));

  // not found
  app.use(function (req, res, next) {
    next(new httpErrors.NotFound());
  });

  app.use(function (err, req, res, next) {
    logger.error(`Error: ${prettyQ(err)}`);
    const _err = err instanceof HttpError ? err : new httpErrors.InternalServerError();
    res.status(_err.status).json(_err); 
  } as ErrorRequestHandler);

  return app;
}
