import {IndicatorObject} from './indicator-object';

export interface IndicatorHolder {
  holder_id: number;
  title?: string;
  indicators: IndicatorObject[];
}
