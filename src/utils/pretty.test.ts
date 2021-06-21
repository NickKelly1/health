import { pretty, prettyQ } from './pretty';

describe('pretty', function() {
  it('should handle simple json', function() {
    expect(pretty({
      _this: 'is',
      a: 'simple',
      json: 'structure',
    })).toStrictEqual(['{',
      '  "_this": "is",',
      '  "a": "simple",',
      '  "json": "structure"',
    '}'].join('\n'));
  });
});

describe('prettyQ', function() {
  it('should handles simple json', function() {
    const prettified = prettyQ({
      _this: 'ist',
      a_simple: 'json_structure',
      json: 'structure',
      no_value: null,
      non_existant: undefined,
    });
    expect(prettified).toContain('_this');
    expect(prettified).toContain('ist');

    expect(prettified).toContain('a_simple');
    expect(prettified).toContain('json_structure');

    expect(prettified).toContain('no_value');
    expect(prettified).toContain('null');

    expect(prettified).toContain('non_existant');
    expect(prettified).toContain('undefined');
  });

  it('should handle symbols', function() {
    const prettified = prettyQ({
      [Symbol('symbol_key')]: Symbol('symbol_value'),
    });
    expect(prettified).toContain('symbol_key');
    expect(prettified).toContain('symbol_value');
  });

  // check for BigInt support
  if (typeof BigInt) {
    it('should handle bigints', function() {
      const big_num = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      expect(prettyQ({ key: big_num })).toContain(big_num.toString());
    });
  }

  it('should handle circular references', function() {
    const A: any = { on_a: 'a' };
    const B: any = { on_b: 'b' };
    B.ref = A;
    A.ref = B;
    const json = { A, B };
    let prettified : string;
    expect(() => (prettified = prettyQ(json))).not.toThrow();
    expect(typeof prettified!).toBe('string');
    expect(prettified!.length).toBeGreaterThan(0);
  });
});