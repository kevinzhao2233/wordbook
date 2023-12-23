import SrtParser2 from 'srt-parser-2';

const parser = new SrtParser2();

export const parseSrt = (text: string) => {
  const srtList = parser.fromSrt(text);
  let resultText = '';
  srtList.forEach((item) => {
    resultText += `${item.text}\n`;
  });
  return resultText;
};
