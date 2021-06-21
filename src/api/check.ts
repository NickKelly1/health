import { Router } from 'express';
import httpErrors from 'http-errors';
import { Icon, IconType } from '../utils/constants';
import isoFetch from 'isomorphic-fetch';
import { prettyQ } from '../utils/pretty';

export const check = Router();

// TODO: caching around URL checks and images

check.get('/', async (req, res, next) => {
  const url = req.query.url;
  if (!url) {  throw new httpErrors.BadRequest('No url given');  }
  if (typeof url !== 'string') { throw new httpErrors.BadRequest('No url or bad url given'); }
  let ifOkay: Icon = {
    type: IconType.fs,
    value: req.query.size === req.config.ICON_SIZE.xxl ? req.config.DEFAULT_ICON.tick_xxl
      : req.query.size === req.config.ICON_SIZE.xl ? req.config.DEFAULT_ICON.tick_xl
      : req.query.size === req.config.ICON_SIZE.l ? req.config.DEFAULT_ICON.tick_l
      : req.query.size === req.config.ICON_SIZE.m ? req.config.DEFAULT_ICON.tick_m
      : req.query.size === req.config.ICON_SIZE.sm ? req.config.DEFAULT_ICON.tick_sm
      : req.config.DEFAULT_ICON.tick_m,
  };
  let ifBad: Icon = {
    type: IconType.fs,
    value: req.query.size === req.config.ICON_SIZE.xxl ? req.config.DEFAULT_ICON.cross_xxl
      : req.query.size === req.config.ICON_SIZE.xl ? req.config.DEFAULT_ICON.cross_xl
      : req.query.size === req.config.ICON_SIZE.l ? req.config.DEFAULT_ICON.cross_l
      : req.query.size === req.config.ICON_SIZE.m ? req.config.DEFAULT_ICON.cross_m
      : req.query.size === req.config.ICON_SIZE.sm ? req.config.DEFAULT_ICON.cross_sm
      : req.config.DEFAULT_ICON.cross_m,
  };

  // okay
  if (typeof req.query.okay === 'string') { ifOkay = { type: IconType.url, value: req.query.okay, }; }

  // bad
  if (typeof req.query.bad === 'string') { ifBad = { type: IconType.url, value: req.query.bad, }; }

  req.log.info(`[${url}] Checking...`);
  try {
    const result = await isoFetch(url, { method: 'GET' });
    switch (result.ok) {
      case true: {
        req.log.info(`[${url}] Success: ${prettyQ(ifOkay)}`);
        switch (ifOkay.type) {
          case IconType.fs: return res.status(200).sendFile(ifOkay.value);
          case IconType.url: return void res.redirect(ifOkay.value)
          default: throw new httpErrors.InternalServerError();
        }
      }
      case false: {
        // 400, 401, 403, 404, ...
        req.log.info(`[${url}] Fail: ${prettyQ(ifBad)}`);
        switch (ifBad.type) {
          case IconType.fs: return res.status(200).sendFile(ifBad.value);
          case IconType.url: return void res.redirect(ifBad.value)
          default: throw new httpErrors.InternalServerError();
        }
      }
      default: throw new httpErrors.InternalServerError();
    }
  } catch (err) {
    // 500, ...
    req.log.warn(`[${url}] Errored: ${prettyQ(err)}`);
    switch (ifBad.type) {
      case IconType.fs: return res.status(200).sendFile(ifBad.value);
      case IconType.url: return void res.redirect(ifBad.value)
      default: throw new httpErrors.InternalServerError();
    }
  }
});

export default check;