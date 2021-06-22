import { Express } from 'express';
import { loggerStream } from './logger';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

export function middleware(app: Express): Express {
  // log access
  app.use(morgan('dev', { stream: loggerStream }));
  // rate limit
  app.use(rateLimit({
    windowMs: app.config.RATE_LIMIT_WINDOW_MS,
    max: app.config.RATE_LIMIT_MAX,
  }));
  app.use(helmet({
    // security policy
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to
        'report-uri': '/csp-reports',
        'report-to': 'default',
        'img-src': [
          '\'self\'',
          // TODO: env
          'https://*.nickkelly.dev',
          // 'data:',
          'blob:'
        ],
      },
    }
  }));

  // reporting location for csp violations
  // https://canhas.report/csp-report-to
  app.use(function (req, res, next) {
    res.setHeader('Report-To', JSON.stringify({
      group: "csp-endpoint",
      'max-age': 10886400,
      endpoints: [{ url: "/csp-reports" }],
    }));
    next();
  })

  // any cors
  app.use(cors())
  // gzip
  app.use(compression());

  return app;
}
