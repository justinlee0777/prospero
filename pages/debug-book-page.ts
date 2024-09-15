/*
import './debug-book.css';

import { cloneDeep } from 'lodash-es';

import div from '../src/elements/div.function';
import ParserBuilder from '../src/parsers/builders/parser.builder.web';
import ParserState from '../src/parsers/models/parser-state.interface';
import { formatVariables } from '../src/utils/debug/format-variables.function';
import containerStyles from './container-style.const';
import { pagesJsonLocation } from './pages-json-location.const';
import transformers from './transformers.const';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(pagesJsonLocation);
  const text = await response.text();

  const parser = new ParserBuilder()
    .fromPageStyles(containerStyles)
    .setTransformers(transformers)
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
*/
