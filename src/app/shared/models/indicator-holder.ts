import {IndicatorObject} from './indicator-object';

export interface IndicatorHolder {
  holder_id: any;
  title?: string;
  indicators?: IndicatorObject[];
}
