import { jescribe } from "../../__tests__/test-utils";
import { Str } from "./str";

jescribe('Str', function() {
  describe('endWith', function() {
    it('appends to the end', function() {
      // should append to the end
      expect(Str.endWith('hello', ' world')).toMatch(/world$/);
    });
    it('doesn\'t append to the end', function() {
      // shouldn't append to the end
      expect(Str.endWith('hello world', 'world')).toBe('hello world');
    });
  });

  describe('cutEnd', function() {
    it('cuts of the end', function() {
      // should cut 'world' off the end
      expect(Str.cutEnd('hello world', 'world')).toMatch('hello ');
    });
    it('doesn\'t append to the end', function() {
      // does nothing - needle 'wurld' was not found
      expect(Str.cutEnd('hello world', 'wurld')).toBe('hello world');
    });
  })
})