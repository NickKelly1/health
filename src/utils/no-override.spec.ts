import { jescribe } from "../../__tests__/test-utils";
import { noOverride } from "./no-override";

jescribe('noOverride', function() {
  it('should add new properties to an object', function() {
    const obj: any = {};
    expect(('hello' in obj)).toBe(false);
    noOverride(obj, 'hello', function hello() {});
    expect(('hello' in obj)).toBe(true);
  })

  it('should throw when overriding existing properties', function() {
    const obj: any = {};
    const fn = () => noOverride(obj, 'toString', function toString() {});
    expect(fn).toThrow(ReferenceError);
  });

  it('should throw when overriding existing symbols', function() {
    const obj: IterableIterator<number> = new Set<number>().values();
    const fn = () => noOverride(
      obj,
      Symbol.iterator,
      function iterator() {
        return {
          next() { return { value: undefined, done: true }; },
          [Symbol.iterator]() { return this; }
        }
      },
    );
    expect(fn).toThrow(ReferenceError);
  });
});