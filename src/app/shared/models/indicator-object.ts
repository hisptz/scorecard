import { Legend } from './legend';

export interface IndicatorObject {
  showTopArrow?: boolean | boolean[];
  showBottomArrow?: boolean | boolean[];
  name: string;
  id: string;
  calculation?: string;
  function_to_use?: string;
  title: string;
  high_is_good?: boolean;
  value?: number;
  weight?: number;
  legend_display?: boolean;
  legendset: Legend[];
  additional_label_values?: any;
  bottleneck_indicators?: any[];
  use_bottleneck_groups?: boolean;
  bottleneck_indicators_groups?: any[];
  arrow_settings: {
    effective_gap: number;
    display: boolean
  };
  label_settings?: {
    display: boolean;
    font_size: string
  };
}
