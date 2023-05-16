import Big from 'big.js';

import max from './max.function';

describe('Big max()', () => {
  test('chooses the larger number', () => {
    expect(max(Big(1), Big(2))).toEqual(Big(2));

    expect(max(Big(2), Big(1))).toEqual(Big(2));

    expect(max(Big(2), Big(2))).toEqual(Big(2));

    expect(max(Big(2), Big(1), Big(3))).toEqual(Big(3));
  });
});
