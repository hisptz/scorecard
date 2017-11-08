/**
 * Created by kelvin on 11/5/17.
 */
export interface IndicatorPreview {
  ouModel: any;
  selectedOu: any;
  selectedPe: any;
  periodType: any;
  year: any;
  analytics: any;
  tableObject: any;
  mapObject: any;
  chartObject: any;
  loading: any;
  visualizationType: string;
  chartType: string;

}

export const INITIAL_INDICATOR_PREVIEW_STATE: IndicatorPreview = {
  ouModel: null,
  selectedOu: null,
  selectedPe: null,
  periodType: null,
  year: null,
  analytics: null,
  tableObject: null,
  mapObject: null,
  chartObject: null,
  loading: true,
  visualizationType: 'table',
  chartType: 'column'
};
