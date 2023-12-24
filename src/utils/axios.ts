import axios, { AxiosStatic } from 'axios';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ', 10);

export interface AxiosJsonp extends AxiosStatic {
  jsonp: (url: string, data?: string | Record<string, any>) => Promise<any>;
}

(axios as AxiosJsonp).jsonp = (url: string, data?: string | Record<string, any>) => {
  if (!url) { throw new Error('url is necessary'); }
  const callback = `CALLBACK__${nanoid()}`;
  const JSONP = document.createElement('script');
  JSONP.setAttribute('type', 'text/javascript');

  const headEle = document.getElementsByTagName('head')[0];

  let ret = '';
  if (data) {
    if (typeof data === 'string') {
      ret = `&${data}`;
    } else if (typeof data === 'object') {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          // eslint-disable-next-line no-loop-func
          data[key].forEach((val: string) => {
            ret += `&${key}=${encodeURIComponent(val)}`;
          });
        } else {
          ret += `&${key}=${encodeURIComponent(data[key])}`;
        }
      }
    }
    // ret += `&_time=${Date.now()}`;
  }
  JSONP.src = `${url}?callback=${callback}${ret}`;
  return new Promise((resolve, reject) => {
    (window as Record<string, any>)[callback] = (r: any) => {
      resolve(r);
      headEle.removeChild(JSONP);
      delete (window as Record<string, any>)[callback];
    };
    headEle.appendChild(JSONP);
  });
};
