import PagesOutput from '../src/models/pages-output.interface';
import { pagesJsonLocation } from './pages-json-location.const';

interface Data {
  desktop: PagesOutput;
  mobile: PagesOutput;
}

export async function getPages(): Promise<Data> {
  const response = await fetch(pagesJsonLocation);
  return await response.json();
}
