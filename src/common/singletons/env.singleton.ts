import dotenv from 'dotenv';
import path from 'path';
import { DIR_ROOT } from '../../dir.root';
import { Extractor } from '../helpers/extractor.helper';

// optional ENV_FILE can be provided...
dotenv.config({ path: process.env.ENV_FILE });

const to = Extractor({ fromObj: process.env, fromName: 'Environment variable' });

export class EnvSingletonKlass {
  is_dev(): boolean { return this.NODE_ENV === 'development'; };
  is_testing(): boolean { return this.NODE_ENV === 'testing'; };
  is_prod(): boolean { return this.NODE_ENV === 'production'; };

  public readonly NODE_ENV = to.oneOf(['production', 'testing', 'development'])('NODE_ENV');
  // required
  public readonly PORT = to.int('PORT');

  public readonly LOG_DIR = to.optional(() => to.string('LOG_DIR')) ?? './storage/logs';
  public readonly LOG_MAX_SIZE = to.optional(() => to.string('LOG_MAX_SIZE')) ?? '20m';
  public readonly LOG_ROTATION_MAX_AGE = to.optional(() => to.string('LOG_ROTATION_MAX_AGE')) ?? '7d';

  // 5 minutes
  public readonly RATE_LIMIT_WINDOW_MS = to.optional(() => to.int('RATE_LIMIT_WINDOW_MS')) ?? 1000 * 60;
  // 100
  public readonly RATE_LIMIT_MAX = to.optional(() => to.int('RATE_LIMIT_MAX')) ?? 100;

  public readonly DIR_PUBLIC = path.normalize(path.join(DIR_ROOT, './public'));
  public readonly DIR_ICONS = path.normalize(path.join(DIR_ROOT, './public/icons'));
  public readonly EXT = path.extname(__filename);

  constructor() {
    //
  }
}

export const EnvSingleton = new EnvSingletonKlass();
