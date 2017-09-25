import { StoreData } from '../store-data';
import {
  ADD_SCORE_CARD, ADD_SCORE_CARDS, DELETE_SCORE_CARD_ACTION, SET_FUNCTIONS, SET_SELECTED_ORGUNIT, SET_SELECTED_PERIOD,
  SET_SELECTED_SCORE_CARD_ACTION,
  UPDATE_ERROR_LOADING_ACTION,
  UPDATE_LOADING_ACTION,
  UPDATE_LOADING_PERCENT_ACTION,
  UPDATE_SCORE_CARD_ACTION
} from '../actions/store.data.action';

import * as _ from 'lodash';
import {_ParseAST} from '@angular/compiler';


export function storeData(state: StoreData, action: any): StoreData {
    switch (action.type)  {

      // set all scorecards
      case ADD_SCORE_CARDS: {
        const newState = _.cloneDeep( state );
        newState.scorecards = action.payload;
        return newState;
      }

      // set one scorecard in store
      case ADD_SCORE_CARD: {
        const newState = _.cloneDeep( state );
        if (!_.find(newState.scorecards, {id: action.payload.id})) {
          newState.scorecards.push( action.payload );
        }
        return newState;
      }


      // set one scorecard in store
      case UPDATE_SCORE_CARD_ACTION: {
        const newState = _.cloneDeep( state );
        newState.scorecards[_.findIndex(newState.scorecards, {id: action.payload.id })] = action.payload;
        return newState;
      }

      // set one scorecard in store
      case DELETE_SCORE_CARD_ACTION: {
        const newState = _.cloneDeep( state );
        newState.scorecards.splice(_.findIndex(newState.scorecards, {id: action.payload }));
        return newState;
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

      default:
        return state;
    }
}















