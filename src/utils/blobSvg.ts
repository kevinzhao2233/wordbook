import * as blobs2 from 'blobs/v2';

export const blobSvg = () => {
  const svgString = blobs2.svg(
    {
      seed: Math.random(),
      extraPoints: 4,
      randomness: 8,
      size: 160,
    },
    {
      fill: '#DD623622',
      // stroke: '#DD6236',
      // strokeWidth: 4,
    },
  );

  return svgString;
};
