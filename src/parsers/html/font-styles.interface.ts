export enum FontStyle {
  'font-family' = 'font-family',
  'font-size' = 'font-size',
  'font-style' = 'font-style',
  'font-weight' = 'font-weight',
}

export const ValidFontStyles: Array<string> = Object.values(FontStyle);

export type FontStyles = {
  [fontStyle in FontStyle]?: string;
};
