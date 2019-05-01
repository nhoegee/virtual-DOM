export const zip = <X, Y>(xs: Array<X>, ys: Array<Y>): [X, Y][] => {
  const zipped: [X, Y][] = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    zipped.push(
      [xs[i], ys[i]]
    );
  }
  return zipped;
};
