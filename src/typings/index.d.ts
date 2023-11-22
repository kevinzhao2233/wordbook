import { RuleObject } from 'ant-design-vue/es/form/interface';

export type FormRules<K> = Partial<Record<keyof K, RuleObject | RuleObject[]>>;

declare global {
  interface Window {
  }
}
