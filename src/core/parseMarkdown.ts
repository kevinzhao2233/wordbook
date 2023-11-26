import MarkdownIt from 'markdown-it';
import containerPlugin from 'markdown-it-container';
import anchorPlugin from 'markdown-it-anchor';
import { slugify } from '@mdit-vue/shared';

export const parseMarkdownToHtml = (text: string) => {
  const md: MarkdownIt = new MarkdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  });

  md.use(anchorPlugin, {
    level: [1, 2, 3, 4, 5, 6],
    slugify,
    permalink: false,
  });

  const html = md.render(text);

  return html;
};
