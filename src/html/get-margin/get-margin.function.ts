import BoxProperties from './box-properties.interface';

/**
 * Interprets the margin CSS value and returns the calculated margins into JS.
 * Only accepts pixel.
 */
export default function getMargin(cssValue: string): BoxProperties {
  const values = cssValue.split(' ').map((value) => parseInt(value));

  if (values.length > 3) {
    return {
      top: values[0],
      right: values[1],
      bottom: values[2],
      left: values[3],
    };
  } else if (values.length > 2) {
    const [top, x, bottom] = values;

    return {
      top,
      right: x,
      bottom,
      left: x,
    };
  } else if (values.length > 1) {
    const [y, x] = values;

    return {
      top: y,
      right: x,
      bottom: y,
      left: x,
    };
  } else {
    const [value] = values;

    return {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
  }
}
