import path from 'path';
import { DIR_ROOT } from './dir';
import { Extractor } from './utils/extractor';
import { KeyMap } from './utils/keymap';
import fs from 'fs';
import md5 from 'md5';

const version: string = JSON.parse(fs
  .readFileSync(path.join(DIR_ROOT, 'package.json'))
  .toString('utf-8')).version;

if (!version) throw new Error('Failed to parse version');

export interface ConfigOptions {
  NODE_ENV: 'development' | 'production' | 'testing';
  PORT: number;
  LOG_DIR?: string;
  LOG_MAX_SIZE?: string;
  LOG_ROTATION_MAX_AGE?: string;
  RATE_LIMIT_WINDOW_MS?: number;
  RATE_LIMIT_MAX?: number;
  CACHE_VIEWS?: boolean;
  CACHE_ASSETS?: boolean;
}

const key: KeyMap<Required<ConfigOptions>> = {
  LOG_DIR: 'LOG_DIR',
  PORT: 'PORT',
  LOG_MAX_SIZE: 'LOG_MAX_SIZE',
  LOG_ROTATION_MAX_AGE: 'LOG_ROTATION_MAX_AGE',
  NODE_ENV: 'NODE_ENV',
  RATE_LIMIT_MAX: 'RATE_LIMIT_MAX',
  RATE_LIMIT_WINDOW_MS: 'RATE_LIMIT_WINDOW_MS',
  CACHE_VIEWS: 'CACHE_VIEWS',
  CACHE_ASSETS: 'CACHE_ASSETS',
};

export class Config {
  // options
  //  required
  public readonly NODE_ENV: 'production' | 'testing' | 'development';
  public readonly PORT: number;

  //  optional
  public readonly LOG_DIR: string;
  public readonly LOG_MAX_SIZE: string;
  public readonly LOG_ROTATION_MAX_AGE: string;
  public readonly RATE_LIMIT_WINDOW_MS: number;
  public readonly RATE_LIMIT_MAX: number;
  public readonly CACHE_VIEWS: boolean;
  public readonly CACHE_ASSETS: boolean;

  // constants
  public readonly VERSION: string = version;
  public readonly VER: string = md5(version); // version hash for page caching

  public readonly DIR_PUBLIC = path.normalize(path.join(DIR_ROOT, './public'));
  public readonly DIR_ICONS = path.normalize(path.join(DIR_ROOT, './public/assets/icons'));
  public readonly EXT = path.extname(__filename);
  public readonly FILE_README = path.normalize(path.join(DIR_ROOT, './readme.md'));

  public readonly DEFAULT_ICON = {
    cross_xxl: path.normalize(path.join(this.DIR_ICONS, './cross_100x100.png')),
    cross_xl: path.normalize(path.join(this.DIR_ICONS, './cross_64x64.png')),
    cross_l: path.normalize(path.join(this.DIR_ICONS, './cross_32x32.png')),
    cross_m: path.normalize(path.join(this.DIR_ICONS, './cross_16x16.png')),
    cross_sm: path.normalize(path.join(this.DIR_ICONS, './cross_8x8.png')),
    tick_xxl: path.normalize(path.join(this.DIR_ICONS, './tick_100x100.png')),
    tick_xl: path.normalize(path.join(this.DIR_ICONS, './tick_64x64.png')),
    tick_l: path.normalize(path.join(this.DIR_ICONS, './tick_32x32.png')),
    tick_m: path.normalize(path.join(this.DIR_ICONS, './tick_16x16.png')),
    tick_sm: path.normalize(path.join(this.DIR_ICONS, './tick_8x8.png')),
  }

  public readonly ICON_SIZE = {
    xxl: 'xxl',
    xl: 'xl',
    l: 'l',
    m: 'm',
    sm: 'sm',
  } as const;


  constructor(options: ConfigOptions) {
    const extract = new Extractor(options, 'Config');

    this.NODE_ENV = extract.oneOf(['production', 'testing', 'development'])(key.NODE_ENV);
    this.PORT = extract.integer(key.PORT);

    // optional
    this.LOG_DIR = extract.optional(() => extract.string(key.LOG_DIR)) ?? path.join('.', 'storage', 'logs');
    this.LOG_MAX_SIZE = extract.optional(() => extract.string(key.LOG_MAX_SIZE)) ?? '20m';
    this.LOG_ROTATION_MAX_AGE = extract.optional(() => extract.string(key.LOG_ROTATION_MAX_AGE)) ?? '7d';

    // 5 minutes
    this.RATE_LIMIT_WINDOW_MS = extract.optional(() => extract.integer(key.RATE_LIMIT_WINDOW_MS)) ?? 1000 * 60;
    this.RATE_LIMIT_MAX = extract.optional(() => extract.integer(key.RATE_LIMIT_MAX)) ?? 500;

    this.CACHE_VIEWS = extract.optional(() => extract.boolean('CACHE_VIEWS')) ?? true;
    this.CACHE_ASSETS = extract.optional(() => extract.boolean('CACHE_ASSETS')) ?? true;
  }

  is_dev(): boolean { return this.NODE_ENV === 'development'; };
  is_testing(): boolean { return this.NODE_ENV === 'testing'; };
  is_prod(): boolean { return this.NODE_ENV === 'production'; };
}
