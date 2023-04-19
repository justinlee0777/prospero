import './debug-book.css';

import Big from 'big.js';

import ContainerStyle from '../src/container-style.interface';
import getWordWidth from '../src/get-word-width.function';
import getNormalizedPageHeight from '../src/get-normalized-page-height.function';
import { DefaultLinkBreakParser } from '../src/parsers/default-line-break/default-line-break.parser';
import div from '../src/elements/div.function';
import { formatVariables } from '../src/utils/debug/format-variables.function';
import ParserState from '../src/parsers/models/parser-state.interface';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/proteus.txt');
  const text = await response.text();

  const containerStyles: ContainerStyle = {
    width: 375,
    height: 667,
    computedFontFamily: 'Arial',
    computedFontSize: '16px',
    lineHeight: 24,
    padding: {
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    },
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    border: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    textIndent: '     ',
  };

  const containerWidth =
    containerStyles.width -
    containerStyles.padding.left -
    containerStyles.padding.right -
    containerStyles.margin.left -
    containerStyles.margin.right -
    containerStyles.border.left -
    containerStyles.border.right;

  const pageHeight = getNormalizedPageHeight(
    containerStyles.height -
      containerStyles.padding.top -
      containerStyles.padding.bottom -
      containerStyles.margin.top -
      containerStyles.margin.bottom -
      containerStyles.border.top -
      containerStyles.border.bottom,
    containerStyles.lineHeight
  );

  const numLines = pageHeight / containerStyles.lineHeight;

  const calculateWordWidth = getWordWidth(
    containerStyles.computedFontSize,
    containerStyles.computedFontFamily
  );

  const textIndentWidth = calculateWordWidth(containerStyles.textIndent);

  document.body.appendChild(
    div({
      textContent: `container width: ${containerWidth}px`,
      styles: {
        position: 'fixed',
        top: '3em',
        right: '3em',
      },
    })
  );

  const parser = new DefaultLinkBreakParser({
    textIndent: {
      text: containerStyles.textIndent,
      width: Big(textIndentWidth),
    },
    pageLines: numLines,
    pageWidth: containerWidth,
    calculateWordWidth,
  });

  const filter = (parserState: ParserState) => parserState.pages.length === 13;

  const parserStates = parser.generateParserStates(text);

  for (const parserState of parserStates) {
    if (filter(parserState)) {
      const copy = { ...parserState };
      delete copy['pages'];
      delete copy['lines'];

      document.body.appendChild(
        div({
          textContent: formatVariables(copy),
          styles: {
            marginBottom: '3em',
          },
        })
      );
    }
  }
});
