import express, { ErrorRequestHandler, Express, } from 'express';
import httpErrors, { HttpError } from 'http-errors';
import { logger, loggerStream } from './logger';
import { prettyQ } from './utils/pretty';
import { check } from './api/check';
import { _health } from './api/_health';
import md from 'markdown-it';
import fs from 'fs/promises';

export function routing(app: Express): Express {

  let readme: undefined | string;
  app.get('/', async function (req, res) {
    readme = readme ?? await fs
      .readFile(req.config.FILE_README)
      .then(buf => md({
        html: true,
        typographer: true,
      }).render(buf.toString('utf-8')))

    res.render('pages/index.ejs', { readme });
  });

  // serve public
  app.use(express.static(app.config.DIR_PUBLIC, { extensions: ['html'], }));

  // endpoint
  app.use('/check', check);

  // health check
  app.use('/_health', _health);

  // content security policy violations
  // TODO: test this
  app.post('/csp-reports', function (req, res, next) {
    logger.warn(`csp violation:\n${prettyQ(req.body)}`);
    res.status(200).json({ message: 'okay', });
  });

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
