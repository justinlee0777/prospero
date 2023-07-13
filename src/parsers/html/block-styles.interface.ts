enum BlockStyle {
  margin = 'margin',
}

export const ValidBlockStyles: Array<string> = Object.values(BlockStyle);

export type BlockStyles = {
  [blockStyle in BlockStyle]?: string;
};
