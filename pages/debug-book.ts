import './debug-book.css';

import { cloneDeep } from 'lodash-es';

import div from '../src/elements/div.function';
import { formatVariables } from '../src/utils/debug/format-variables.function';
import ParserState from '../src/parsers/models/parser-state.interface';
import ParserBuilder from '../src/parsers/builders/parser.builder';
import getTextSample from './get-text-sample.function';
import containerStyles from './container-style.const';
import processors from './processors.const';

window.addEventListener('DOMContentLoaded', async () => {
  const text = await getTextSample();

  const parser = new ParserBuilder()
    .fromContainerStyle(containerStyles)
    .processors(processors)
    .build();

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

  const filter = (parserState: ParserState) => parserState.pages.length === 2;

  const parserStates = parser.generateParserStates(text);

  for (const parserState of parserStates) {
    if (filter(parserState)) {
      const copy = cloneDeep(parserState);
      delete copy['changes'];
      delete copy['pageChanges'];
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
