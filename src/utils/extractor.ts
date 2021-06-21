export interface ExtractorOptions {
  implicitConversions: true;
}

/**
 * Extracts values from an object, with assertions
 * 
 * Useful for extracting environment variables
 */
export class Extractor {
  /**
   * @param obj the object to extract properties from
   * @param objName for logging
   * @param options
   */
  constructor(
    protected readonly obj: Record<PropertyKey, any>,
    protected readonly objName: string,
    protected readonly options: ExtractorOptions = {
      implicitConversions: true,
    },
  ) {
    //
  }

  /**
   * Retrieve the value of the objects key
   *
   * @param key
   */
  protected extract(key: PropertyKey): any | undefined {
    // can't use "symbol" as index
    // https://github.com/microsoft/TypeScript/issues/1863
    return this.obj[key as unknown as string];
  }

  /**
   * Extract a value, failing if not found
   *
   * @param key
   */
  protected extractAssert<V>(key: PropertyKey): any {
    const val = this.extract(key);
    if (!(key in this.obj)) {
      throw new ReferenceError(`${this.objName} "${String(key)}" must be defined`);
    }
    return val;
  }

  /**
   * Make an extraction optional
   *
   * @param fn
   */
  public optional<T>(fn: () => T): undefined | T {
    try {
      const result = fn();
      return result;
    } catch(err) {
      return undefined;
    }
  }

  /**
   * Extract a string property
   *
   * @param key
   */
  public string(key: PropertyKey): string {
    let val = this.extractAssert(key);

    if (this.options.implicitConversions) {
      switch (typeof val) {
        case 'number':
        case 'boolean':
          val = String(val);
      }
    }

    if (typeof val !== 'string') {
      throw new TypeError(`${this.objName} "${String(key)}" must be a string`);
    }

    return val;
  }

  /**
   * Extract a number property
   *
   * @param key
   */
  public number(key: PropertyKey): number {
    let val = this.extractAssert(key);

    if (this.options.implicitConversions) {
      val = Number(val);
    }

    if (typeof val !== 'number') {
      throw new TypeError(`${this.objName} "${String(key)}" must be a number`);
    }

    if (!Number.isFinite(val)) {
      throw new TypeError(`${this.objName} "${String(key)}" must be a number`);
    }

    return val;
  }

  /**
   * Extract an integer property
   *
   * @param key
   */
  public integer(key: string): number {
    const raw = String(this.extractAssert(key))
    const val = parseInt(raw);

    if (!Number.isFinite(val)) {
      throw new TypeError(`${this.objName} "${String(key)}" must be an integer`);
    }

    // check for floats (truncated by parseInt)
    if (raw !== val.toString()) {
      throw new TypeError(`${this.objName} "${String(key)}" must be an integer`);
    }

    return val;
  }

  /**
   * Extract a boolean property
   *
   * @param key
   */
  public boolean(key: PropertyKey): boolean {
    let raw = this.extractAssert(key);

    switch (typeof raw) {
      case 'boolean': return raw;
      case 'string': {
        if (!this.options.implicitConversions) break;
        raw = raw.trim().toLowerCase();
        if (raw === 'true') return true;
        if (raw === '1') return true;
        if (raw === 'false') return false;
        if (raw === '0') return false;
        break;
      }
      case 'number': {
        if (!this.options.implicitConversions) break;
        if (raw === 1) return true;
        if (raw === 0) return false;
        break;
      }
    }

    throw new TypeError(`${this.objName} "${String(key)}" must be a boolean`);
  }

  /**
   * Extract a property that must be one of the given values
   *
   * @param arg
   */
  public oneOf<T extends string>(arg: T[]) {
    return (key: PropertyKey): T => {
      let val = this.extractAssert(key);
      if (!arg.some(acceptable => acceptable === val)) {
        throw new TypeError(`${this.objName} "${String(key)}" must be one of ${arg.map(String).join(', ')}`);
      }
      return val as T;
    }
  }

  /**
   * Extract a <seperator>-separated string list property,
   * whose values must be within the given subset
   *
   * @param arg
   * @returns
   */
  public subsetOf<T extends string>(arg: T[], separator = ',') {
    return (key: string): T[] => {
      // allow empty values input
      let raw = this.optional(() => this.string(key)) ?? ''; 
      // remove empty strings
      const strs = raw.split(separator).filter(Boolean);
      // find values not in subset
      const extra = strs.filter((val: any) => !arg.some(ar => ar === val));
      if (extra.length) throw new TypeError(`${this.objName} "${String(key)}" has unexpectd values: "${extra.join(',')}"`);
      return strs as T[];
    }
  }
}
