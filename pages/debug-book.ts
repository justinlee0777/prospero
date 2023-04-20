import './debug-book.css';

import ContainerStyle from '../src/container-style.interface';
import div from '../src/elements/div.function';
import { formatVariables } from '../src/utils/debug/format-variables.function';
import ParserState from '../src/parsers/models/parser-state.interface';
import ParserBuilder from '../src/parsers/builders/parser.builder';

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

  const parser = ParserBuilder.fromContainerStyle(containerStyles);

  document.body.appendChild(
    div({
      textContent: `container width: ${parser.debug.pageWidth}px`,
      styles: {
        position: 'fixed',
        top: '3em',
        right: '3em',
      },
    })
  );

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
