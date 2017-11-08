import { StoreData } from '../store-data';
import {
  ADD_SCORE_CARD, ADD_SCORE_CARDS, DELETE_SCORE_CARD_ACTION, SET_FUNCTIONS, SET_PREVIEW_STATUS, SET_SELECTED_ORGUNIT, SET_SELECTED_PERIOD,
  SET_SELECTED_SCORE_CARD_ACTION,
  UPDATE_ERROR_LOADING_ACTION,
  UPDATE_LOADING_ACTION,
  UPDATE_LOADING_PERCENT_ACTION,
  UPDATE_SCORE_CARD_ACTION
} from '../actions/store.data.action';

import * as _ from 'lodash';


export function storeData(state: StoreData, action: any): StoreData {
    switch (action.type)  {

      // set all scorecards
      case ADD_SCORE_CARDS: {
        return {
          ...state,
          ...action.payload
        };
      }

      // set one scorecard in store
      case ADD_SCORE_CARD: {
        if (!_.find(state.scorecards, {id: action.payload.id})) {
          return {
            ...state,
            scorecards: [...state.scorecards, action.payload]
          };
        }
        return state;
      }


      // set one scorecard in store
      case UPDATE_SCORE_CARD_ACTION: {
        const index = _.findIndex(state.scorecards, {id: action.payload.id });
        const scorecard = state.scorecards[index];
        const updatedScorecard = {
          ...scorecard,
          ...action.payload
        };
        const scorecards = [...state.scorecards];
        scorecards[index] = updatedScorecard;
        return {
          ...state,
          scorecards: scorecards
        };
      }

      // set one scorecard in store
      case DELETE_SCORE_CARD_ACTION: {
        const scorecards = [...state.scorecards];
        scorecards.splice(_.findIndex(scorecards, {id: action.payload }));
        return {
          ...state,
          scorecards: scorecards
        };
      }


      // set scorecard loading status
      case UPDATE_LOADING_ACTION:
        return <StoreData>{...state, loadingScorecards: action.payload};

      // set scorecard loading status
      case UPDATE_LOADING_PERCENT_ACTION:
        return <StoreData>{...state, loadingPercent: action.payload};

      // set scorecard loading status
      case SET_SELECTED_SCORE_CARD_ACTION:
        return <StoreData>{...state, selectedScorecard: action.payload};

      // set error status if something went wrong while loading scorecards
      case UPDATE_ERROR_LOADING_ACTION:
        return <StoreData>{...state, errorloadingScorecards: action.payload};

      // set error status if something went wrong while loading scorecards
      case SET_SELECTED_PERIOD:
        return <StoreData>{...state, selectedPeriod: action.payload};

      // set error status if something went wrong while loading scorecards
      case SET_SELECTED_ORGUNIT:
        return <StoreData>{...state, selectedOrgunit: action.payload};

      // set error status if something went wrong while loading scorecards
      case SET_FUNCTIONS:
        return <StoreData>{...state, functions: action.payload};

      // set status of the indicator preview window
      case SET_PREVIEW_STATUS:
        return <StoreData>{...state, showPreview: action.payload};

      default:
        return state;
    }
}















