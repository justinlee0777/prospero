import PagesOutput from '../src/pages-output.interface';
import { pagesJsonLocation } from './pages-json-location.const';

export async function getPages(): Promise<PagesOutput> {
  const response = await fetch(pagesJsonLocation);
  return await response.json();
}
