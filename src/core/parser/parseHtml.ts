export const parseHtml = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;

  const els = container.childNodes;
  let raw = '';
  if (els && els.length) {
    els.forEach((el) => {
      if (['#text', 'SCRIPT', 'STYLE', 'DIV', 'PRE'].includes(el.nodeName)) return;
      // // 给 code 元素的内容打上标记，暂时去掉，看各家翻译接口怎么对待，如果能返回单词，那说明就是单词，不能就不展示
      // (el as HTMLElement).querySelectorAll('code').forEach((codeEl: HTMLElement) => {
      //   const text = codeEl.innerText;
      //   codeEl.innerText = `<$code>${text}</$code>`;
      // });
      raw += (el as HTMLElement).innerText ? `${(el as HTMLElement).innerText}\n` : '\n';
    });
  }

  container.remove();
  return raw;
};
