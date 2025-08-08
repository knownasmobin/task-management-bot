const Utils = require('../utils');

describe('Utils', () => {
  test('deepClone produces independent copy', () => {
    const src = { a: 1, b: { c: [1, 2, { z: 3 }] } };
    const clone = Utils.deepClone(src);
    expect(clone).toEqual(src);
    clone.b.c[2].z = 99;
    expect(src.b.c[2].z).toBe(3);
  });

  test('validation helpers', () => {
    expect(Utils.isValidEmail('user@example.com')).toBe(true);
    expect(Utils.isValidEmail('bad@email')).toBe(false);
    expect(Utils.isValidPhone('+1 (555) 123-4567')).toBe(true);
    expect(Utils.isValidPhone('abc')).toBe(false);
  });
});
