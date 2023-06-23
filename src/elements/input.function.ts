import { HTMLInputTypeAttribute } from 'react';
import CreateElement from './create-element.interface';
import setElement from './set-element.function';

interface HTMLInputAttributes {
  minlength?: number;
  maxlength?: number;
}

type CreateInputElement = CreateElement<HTMLInputElement> extends (
  ...args: infer U
) => infer R
  ? (
      type: HTMLInputTypeAttribute,
      attributes?: HTMLInputAttributes,
      ...args: U
    ) => R
  : never;

const input: CreateInputElement = (
  type,
  { minlength, maxlength } = {},
  ...args
) => {
  const element = document.createElement('input');

  element.type = type;

  minlength ?? (element.minLength = minlength);
  maxlength ?? (element.maxLength = maxlength);

  setElement(element, ...args);

  return element;
};

export default input;
