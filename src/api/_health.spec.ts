import supertest from 'supertest';
import { Express } from 'express';
import { createMockApp, jescribe, } from "../../__tests__/test-utils";
import { _health } from './_health';

jescribe('_health endpoint', function() {
  let app: Express;

  beforeEach(async function () {
    app = createMockApp();
    await app.start();
  });

  afterEach(async function () {
    await app.stop();
  })

  it('GET /_health 200', function (done) {
    supertest(app)
      .get('/_health')
      .expect(200)
      .end(done)
  });
});
