import { Express } from "express";
import { middleware } from "../src/middleware";
import { routing } from "../src/routing";
import { createApp } from "../src/utils/create-app";
import { jescribe, mockConfig, } from "./test-utils";

jescribe('e2e', function() {
  let app: Express;

  beforeEach(async function() {
    app = createApp(mockConfig);
    middleware(app);
    routing(app);
    await app.start();
  });

  afterEach(async () => {
    await app.stop();
  })

  test('listens', function() {
    const address = app.server.address()!;
    expect(address).not.toBe(null);

    switch (typeof address) {
      case 'string':
        expect(String(new URL(address).port)).toBe(String(app.config.PORT));
        break;
      case 'object':
        expect(String(address.port)).toBe(String(app.config.PORT));
        break;
      default:
        fail('unexpected "address" type');
    }
  });
});