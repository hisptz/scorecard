import {IndicatorPreview} from '../indicatorPreview';
import * as previewActions from '../actions/indicator-preview.action';
/**
 * Created by kelvin on 11/5/17.
 */
export function indicatorPreview(state: IndicatorPreview, action: any): IndicatorPreview {
  switch (action.type)  {

    case previewActions.SET_OU_MODEL_ACTION:
      return <IndicatorPreview>{...state, ouModel: action.payload};

    case previewActions.SET_SELECTED_OU_ACTION:
      return <IndicatorPreview>{...state, selectedOu: action.payload};

    case previewActions.SET_PERIOD_TYPE_ACTION:
      return <IndicatorPreview>{...state, periodType: action.payload};

    case previewActions.SET_SELECTED_PERIOD_ACTION:
      return <IndicatorPreview>{...state, selectedPe: action.payload};

    case previewActions.SET_YEAR_ACTION:
      return <IndicatorPreview>{...state, year: action.payload};

    case previewActions.SET_ANALYTICS_ACTION:
      return <IndicatorPreview>{...state, analytics: action.payload};

    case previewActions.SET_TABLE_OBJECT_ACTION:
      return <IndicatorPreview>{...state, tableObject: action.payload};

    case previewActions.SET_MAP_OBJECT_ACTION:
      return <IndicatorPreview>{...state, mapObject: action.payload};

    case previewActions.SET_CHART_OBJECT_ACTION:
      return <IndicatorPreview>{...state, chartObject: action.payload};

    case previewActions.SET_LOADING_ACTION:
      return <IndicatorPreview>{...state, loading: action.payload};

    default:
      return state;
  }
}
