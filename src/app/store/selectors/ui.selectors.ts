import { createSelector } from '@ngrx/store';
import {getUiState} from '../reducers';
import * as fromUiState from '../reducers/ui.reducer';

export const getViewTitle = createSelector(getUiState, fromUiState.getViewTitle);

export const getViewStyle = createSelector(getUiState, fromUiState.getViewStyle);

export const getHomeLoadingPercent = createSelector(getUiState, fromUiState.getHomeLoadingPercent);

