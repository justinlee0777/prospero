import FontLocations from '../../models/font-locations.interface';

export default async function registerFont(
  fontFamily: string,
  fontLocation: FontLocations
): Promise<void> {
  if (typeof fontLocation === 'undefined') {
    fontLocation = [];
  } else if (typeof fontLocation === 'string') {
    fontLocation = [
      {
        url: fontLocation,
      },
    ];
  }

  return Promise.all(
    fontLocation.map(async ({ url, style, weight }) => {
      const fontFace = new FontFace(fontFamily, `url(${url})`, {
        style,
        weight,
      });

      document.fonts.add(fontFace);

      return fontFace.load();
    })
  ).then();
}
