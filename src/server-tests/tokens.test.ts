import { addToken, removeToken, validateToken } from '../tokens';
import { clearV1 } from '../other';

beforeEach(() => {
  clearV1();
});

// addToken function
describe('addToken, validateToken function', () => {
  test('correct return type', () => {
    const res = addToken(1);

    expect(typeof res).toBe('string');
    expect(validateToken(res)).toBe(1);
  });

  test('correctly updates dataStore', () => {
    const res1 = addToken(1);
    const res2 = addToken(2);
    const res3 = addToken(1);

    expect(validateToken(res1)).toBe(1);
    expect(validateToken(res2)).toBe(2);
    expect(validateToken(res3)).toBe(1);
  });
});

// removeToken function
describe('removeToken, validateToken function', () => {
  test('correct return type', () => {
    const hash = addToken(1);

    const res = removeToken(hash);

    expect(typeof res).toBe('boolean');
  });

  test('correctly updates dataStore', () => {
    const hash = addToken(1);

    expect(validateToken(hash)).toBe(1);

    const res = removeToken(hash);
    expect(res).toBe(true);

    expect(() => validateToken(hash)).toThrowError();
  });

  test('returns error if token doesn\'t exist', () => {
    const res = removeToken('invalid_hash');

    expect(res).toBe(false);
  });
});
