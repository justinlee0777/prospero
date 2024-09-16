import PageStyles from '../../src/models/page-styles.interface';
import PagesAsIndicesOutput from '../../src/models/pages-as-indices-output.interface';
import containerStyles from '../container-style.const';
import workOnChapter from './work-on-chapter';

const chapters = [
  'telemachus',
  'nestor',
  'proteus',
  'calypso',
  'lotus-eaters',
  'hades',
  'aeolus',
  'lestrygonians',
  'scylla-and-charybdis',
  'wandering-rocks',
  'sirens',
  'cyclops',
  'nausicaa',
  'oxen-of-the-sun',
  'circe',
  'eumaeus',
  'ithaca',
  'penelope',
];

const mobileStyles: PageStyles = {
  ...containerStyles,
  computedFontSize: '12px',
  computedFontFamily: 'Bookerly',
};

const desktopStyles: PageStyles = {
  ...containerStyles,
  computedFontSize: '16px',
  computedFontFamily: 'Bookerly',
};

const responses = await Promise.all(
  chapters.map((chapter) =>
    workOnChapter({
      mobileStyles,
      desktopStyles,
      filename: `./text-samples/ulysses/${chapter}.txt`,
    })
  )
);

let compiledText = '';

let mobile: PagesAsIndicesOutput['pages'] = [];
let mobileIndex = 0;

let desktop: PagesAsIndicesOutput['pages'] = [];
let desktopIndex = 0;

responses.forEach((response) => {
  // Using 'desktop' is arbitrary as they should both be equal
  compiledText += response.desktop.text;

  response.mobile.pages.forEach((mobilePage) => {
    mobile.push({
      beginIndex: mobileIndex + mobilePage.beginIndex,
      endIndex: mobileIndex + mobilePage.endIndex,
    });
  });

  response.desktop.pages.forEach((desktopPage) => {
    desktop.push({
      beginIndex: desktopIndex + desktopPage.beginIndex,
      endIndex: desktopIndex + desktopPage.endIndex,
    });
  });

  // Add an empty page.
  desktop.push({
    beginIndex: desktop.at(-1).endIndex,
    endIndex: desktop.at(-1).endIndex,
  });

  mobileIndex += response.mobile.pages.at(-1).endIndex;
  desktopIndex += response.desktop.pages.at(-1).endIndex;
});

const mobilePages: PagesAsIndicesOutput = {
  pages: mobile,
  pageStyles: mobileStyles,
  text: compiledText,
};

const desktopPages: PagesAsIndicesOutput = {
  pages: desktop,
  pageStyles: desktopStyles,
  text: compiledText,
};

const url = 'https://iamjustinlee.com/api';

try {
  let response = await fetch(`${url}/prospero/texts/ulysses/mobile`, {
    method: 'PUT',
    body: JSON.stringify(mobilePages),
  });

  console.log(response.status);

  response = await fetch(`${url}/prospero/texts/ulysses/desktop`, {
    method: 'PUT',
    body: JSON.stringify(desktopPages),
  });

  console.log(response.status);

  process.exit(0);
} catch (error) {
  console.log(error);

  process.exit(1);
}
