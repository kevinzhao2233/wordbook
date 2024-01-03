import { RuleObject } from 'ant-design-vue/es/form/interface';
import type { LocalForage } from 'localforage';

export type FormRules<K> = Partial<Record<keyof K, RuleObject | RuleObject[]>>;

declare global {
  interface Window {
    dictionaryStore: LocalForage;
    bookStore: LocalForage;
  }
}

export interface WorkerEventData {
  type: string;
  payload: any;
}
