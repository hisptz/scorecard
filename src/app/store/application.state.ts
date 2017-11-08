import {INITIAL_UI_STATE, UiState} from './ui-state';
import {INITIAL_STORE_DATA, StoreData} from './store-data';
import {IndicatorPreview, INITIAL_INDICATOR_PREVIEW_STATE} from './indicatorPreview';
/**
 * Created by kelvin on 7/29/17.
 */

export interface ApplicationState {
  uiState: UiState;
  indicatorPreview: IndicatorPreview;
  storeData: StoreData;
}
export const INITIAL_APPLICATION_STATE: ApplicationState = {
  uiState: INITIAL_UI_STATE,
  indicatorPreview: INITIAL_INDICATOR_PREVIEW_STATE,
  storeData: INITIAL_STORE_DATA
};

export function getInitialState() {
  return INITIAL_APPLICATION_STATE;
}
