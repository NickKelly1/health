import { jescribe } from '../../__tests__/test-utils';
import { Extractor } from './extractor';
import { keymap } from './keymap';


jescribe('Extractor', function() {
  const UNKNOWN_PROPERTY = 'UNKNOWN_PROPERTY';

  const obj = {
    string: 'a_stringProperty',
    float: 1.5,
    integer: 1,

    boolean_true: true,
    boolean_false: false,

    boolean_string_true: 'TrUe',
    boolean_string_false: 'fAlSe',

    boolean_string_1: '1',
    boolean_string_0: '0',

    boolean_number_1: 1,
    boolean_number_0: 0,
  } as const;

  const key = keymap(obj);

  const objName = "TestObject";

  describe('extracts string properties', function() {
    it('should extract a string', function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.string(key.string)).toBe(obj[key.string]);
    });

    it('should throw throws on unknown properties', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.string(UNKNOWN_PROPERTY)).toThrow(ReferenceError);
    });
  });

  describe('extracts number properties', function() {
    it('should extract a number', function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.number(key.float)).toBe(obj[key.float]);
    });

    it('should throw on the wrong type', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.number(key.string)).toThrow(TypeError);
    });

    it('should throws on unknown properties', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.number(UNKNOWN_PROPERTY)).toThrow(ReferenceError);
    });
  });

  describe('extracts integer properties', function() {
    it('should extract an integer', function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.integer(key.integer)).toBe(obj[key.integer]);
    });

    it('should throw on the wrong type', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.integer(key.string)).toThrow(TypeError);
    });

    it('should throw on floats', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.integer(key.float)).toThrow(TypeError);
    });

    it('should throws on unknown properties', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.integer(UNKNOWN_PROPERTY)).toThrow(ReferenceError);
    });
  });

  describe('extracts boolean properties', function() {
    it(`should extract boolean typessucceeds on boolean types`, function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.boolean(key.boolean_true)).toBe(true);
      expect(extractor.boolean(key.boolean_false)).toBe(false);
    });

    it('should extract booleans from numbers', function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.boolean(key.boolean_number_1)).toBe(true);
      expect(extractor.boolean(key.boolean_number_0)).toBe(false);
    });

    it('should extract booleans from strings', function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.boolean(key.boolean_string_true)).toBe(true);
      expect(extractor.boolean(key.boolean_string_false)).toBe(false);
    });

    it('should extract booleans from numeric strings', function() {
      const extractor = new Extractor(obj, objName);;
      expect(extractor.boolean(key.boolean_string_1)).toBe(true);
      expect(extractor.boolean(key.boolean_string_0)).toBe(false);
    });

    it('should throw on wrong types', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.boolean(key.string)).toThrow(TypeError);
    });

    it('should throw on unknown properties', function() {
      const extractor = new Extractor(obj, objName);;
      expect(() => extractor.integer(UNKNOWN_PROPERTY)).toThrow(ReferenceError);
    });
  });

  // todo: more tests
});