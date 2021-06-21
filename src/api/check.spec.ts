import supertest from 'supertest';
import { Express, ErrorRequestHandler } from 'express';
import { createMockApp, createUrl, jescribe, mockConfig, } from "../../__tests__/test-utils";
import { _health } from './_health';
import net from 'net';
import { Str } from '../utils/str';
import { createApp } from '../utils/create-app';
import { middleware } from '../middleware';
import { routing } from '../routing';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

jescribe('/check endpoint', function() {
  let app: Express;

  let checked = false;

  const realEndpoint = '/realendpoint';
  const fakeEndpoint = '/fakeendpoint';

  beforeEach(async function () {
    checked = false;
    app = createApp(mockConfig);
    middleware(app);
    app.get(realEndpoint, (req, res) => {
      checked = true;
      res.status(200).json({});
    });
    routing(app);
    await app.start();
  });

  afterEach(async function () {
    await app.stop();
  })

  function checkUrl(_app: Express, toCheck: URL, extraSearch?: URLSearchParams) {
    const search = new URLSearchParams();
    extraSearch?.forEach((value, key) => { search.append(key, value); });
    search.append('url', toCheck.toString());
    return `/check?${search.toString()}`;
  }

  function realUrl(_app: Express, extraSearch?: URLSearchParams): string {
    const base = createUrl(_app.server.address()!).toString();
    const check = new URL(`${Str.cutEnd(base, '/')}${realEndpoint}`);
    return checkUrl(_app, check, extraSearch);
  }

  function fakeUrl(_app: Express, extraSearch?: URLSearchParams): string {
    const base = createUrl(_app.server.address()!).toString();
    const check = new URL(`${Str.cutEnd(base, '/')}${fakeEndpoint}`);
    return checkUrl(_app, check, extraSearch);
  }

  describe('should 200 for all well-formed requests', function() {
    it('should work for 200\'s', async function() {
      const url = realUrl(app);
      await supertest(app)
        .get(url)
        .expect(200);
    });

    it('should work for 400\'s', async function() {
      const url = fakeUrl(app);
      await supertest(app)
        .get(url)
        .expect(200);
    });

    it('should work for thrown errors', async function() {
      const url = checkUrl(
        app,
        new URL('https://gg.thixwebsitedoesntexistabcdefghsafsdfsdfx.com'),
      );
      await supertest(app)
        .get(url)
        .expect(200);
    });
  });


  describe('should visit the desired URL', function () {
    it(realEndpoint, async function () {
      const url = realUrl(app);
      await supertest(app)
        .get(url)
        .expect(200);
      expect(checked).toBe(true);
    });

    it(fakeEndpoint, async function () {
      const url = fakeUrl(app);
      await supertest(app)
        .get(url)
        .expect(200)
      expect(checked).toBe(false);
    });
  });


  it('should return icons by default', async function() {
    const url = realUrl(app);
      await supertest(app)
        .get(url)
        .expect(200)
        .expect('content-type', /^image\//);
  });

  describe('should redirect', function() {
    it('on success when requested', async function() {
      // expect to be redirected to fake url
      const redirectUrl = fakeUrl(app);
      const url = realUrl(app, new URLSearchParams([['okay', redirectUrl]]));
      await supertest(app)
        .get(url)
        .expect(302)
        .expect('location', redirectUrl)
    })

    it('on fail when requested', async function() {
      // expect to be redirected to real url
      const redirectUrl = realUrl(app);
      const url = fakeUrl(app, new URLSearchParams([['bad', redirectUrl]]));
      await supertest(app)
        .get(url)
        .expect(302)
        .expect('location', redirectUrl)
    });

    it('not on success unless requested', async function () {
      // expect not to be redirected
      const redirectUrl = fakeUrl(app);
      const url = realUrl(app, new URLSearchParams([['bad', redirectUrl]]));
      await supertest(app)
        .get(url)
        .expect(200)
    });

    it('not on fail unless requested', async function () {
      // expect not to be redirected
      const redirectUrl = realUrl(app);
      const url = fakeUrl(app, new URLSearchParams([['okay', redirectUrl]]));
      await supertest(app)
        .get(url)
        .expect(200)
    });
  });

  describe('should respect image sizes', function() {
    it('should return different sized images', async function() {
      const hw = (res: ISizeCalculationResult): [number, number] => {
        expect(res.height).toBeDefined();
        expect(res.width).toBeDefined();
        return [res.height!, res.width!];
      }

      const [sm, m, l, xl, xxl] = await Promise.all([
        supertest(app)
          .get(realUrl(app, new URLSearchParams([['size', 'sm']])))
          .expect(200)
          .then(res => hw(imageSize(res.body))),
        supertest(app)
          .get(realUrl(app, new URLSearchParams([['size', 'm']])))
          .expect(200)
          .then(res => hw(imageSize(res.body))),
        supertest(app)
          .get(realUrl(app, new URLSearchParams([['size', 'l']])))
          .expect(200)
          .then(res => hw(imageSize(res.body))),
        supertest(app)
          .get(realUrl(app, new URLSearchParams([['size', 'xl']])))
          .expect(200)
          .then(res => hw(imageSize(res.body))),
        supertest(app)
          .get(realUrl(app, new URLSearchParams([['size', 'xxl']])))
          .expect(200)
          .then(res => hw(imageSize(res.body))),
      ]);

      const gt = (a: [number, number], b: [number, number]) => {
        return (a[0] > b[0]) || (a[1] > b[1]);
      }

      expect(gt(xxl, xl)).toBe(true);
      expect(gt(xl, l)).toBe(true);
      expect(gt(l, m)).toBe(true);
      expect(gt(m, sm)).toBe(true);
    });
  });
});
