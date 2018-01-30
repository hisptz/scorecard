import {createSelector} from '@ngrx/store';
import {getCurrentIndicatorState} from '../reducers/index';
import * as fromCurrentIndicator from '../reducers/current_indicators.reducer';

export const getAllIndicators = createSelector(getCurrentIndicatorState, fromCurrentIndicator.selectAllCurrentIndicator);
export const getIndicatorsEntities = createSelector(getCurrentIndicatorState, fromCurrentIndicator.selectCurrentIndicatorEntities);
