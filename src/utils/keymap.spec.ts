import { jescribe } from '../../__tests__/test-utils';
import { keymap } from './keymap';

jescribe('keymap', function() {
  const symbol_key = Symbol('test_symbol_key');
  const obj = {
    string_key: 'hello',
    4: 'world',
    [symbol_key]: {},
  };
  const key = keymap(obj);

  it('should keyify strings', function() {
    expect('string_key' in key).toBe(true);
  });

  it('should keyify numbers', function() {
    expect(4 in key).toBe(true);
  });

  it('should keyify symbols', function() {
    expect(symbol_key in key).toBe(true);
  });

  it('shouldn\'t inherit any methods or properties', function() {
    expect(Object.getPrototypeOf(key)).toBe(null);
  });

  it('shouldn\'t give false positives', function() {
    expect('some_string' in key).toBe(false);
    expect(0 in key).toBe(false);
    expect(Symbol('some_symbol') in key).toBe(false);

    expect('toString' in key).toBe(false);
  });
});
