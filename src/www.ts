import dotenv from 'dotenv';
import { Config, ConfigOptions } from './config';
import { setupLogger, logger } from './logger';
import { middleware } from "./middleware";
import { createApp } from './utils/create-app';
import { routing } from './routing';

dotenv.config({ path: process.env.ENV_FILE });
const config = new Config(process.env as unknown as ConfigOptions);
setupLogger(config);
const app = createApp(config);
middleware(app);
routing(app);
app.start(() => { logger.info('started' )});
