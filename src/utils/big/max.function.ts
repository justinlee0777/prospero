import Big from 'big.js';

export default function max(...[x, ...args]: [Big, ...Array<Big>]): Big {
  args.forEach((y) => {
    x.lt(y) && (x = y);
  });

  return x;
}
