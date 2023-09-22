enum BlockStyle {
  margin = 'margin',
  'white-space' = 'white-space',
}

export const ValidBlockStyles: Array<string> = Object.values(BlockStyle);

export type BlockStyles = {
  [blockStyle in BlockStyle]?: string;
};
