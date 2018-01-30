import * as fromuiaction from '../actions/ui.actions';

export interface UiState {
  current_hovered_scorecard: string;
  view_title: string;
  home_loading_percent: number;
  view_style: string;
}

export const initialUiState: UiState = {
  current_hovered_scorecard: '',
  view_title: 'List View',
  home_loading_percent: 0,
  view_style: 'Card'
};


export function uiReducer(
  state = initialUiState,
  action: fromuiaction.UiActions
): UiState {

  switch (action.type) {
    case (fromuiaction.SET_VIEW_TITLE): {
      return {
        ...state,
        view_title: action.payload
      };
    }

    case (fromuiaction.SET_HOME_LOADING_PERCENT): {
      return {
        ...state,
        home_loading_percent: action.payload
      };
    }

    case (fromuiaction.SET_VIEW_STYLE): {
      console.log('nafika');
      let view_style = '';
      if (action.payload === 'List') {
        view_style = 'Card';
      } else if (action.payload === 'Card') {
        view_style = 'Thumbnail';
      } else if (action.payload === 'Thumbnail') {
        view_style = 'List';
      }
      return {
        ...state,
        view_style
      };
    }
  }

  return state;
}

export const getViewTitle = (state: UiState) => state.view_title;
export const getViewStyle = (state: UiState) => state.view_style;
export const getHomeLoadingPercent = (state: UiState) => state.home_loading_percent;
