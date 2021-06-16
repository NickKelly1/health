export type KeyMap<T> = { [K in keyof T]: K };

interface KeymapOptions {
  showNonEnumearble: boolean;
}

export function keymap<T extends {}>(obj: T, options: KeymapOptions = {
  showNonEnumearble: false,
}): KeyMap<T> {
  const ret = Object.create(null) as KeyMap<T>;

  // search up full prototype chain
  let proto = obj;
  while (proto != null) {
    if (options.showNonEnumearble) {
      // all own string & number properties
      (Object
        .getOwnPropertyNames(proto) as (keyof T)[])
        .forEach((key) => { ret[key] = key; });
    } else {
      // all own enumerable string & number properties
      (Object
        .keys(proto) as (keyof T)[])
        .forEach((key) => { ret[key] = key; });
    }

    // all own symbol properties
    (Object
      .getOwnPropertySymbols(proto)
      .map(sym => [sym, Object.getOwnPropertyDescriptor(proto, sym)] as const)
      // only enumerable properties
      .filter(([,desc]) => desc && (options.showNonEnumearble || desc.enumerable)) as [keyof T, PropertyDecorator][])
      .forEach(([sym, desc]) => { ret[sym] = sym; });

    proto = Object.getPrototypeOf(proto);
  }

  return ret;
}
