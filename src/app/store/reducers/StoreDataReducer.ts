import { StoreData } from '../store-data';
import {
  ADD_SCORE_CARD, ADD_SCORE_CARDS, DELETE_SCORE_CARD_ACTION, SET_SELECTED_SCORE_CARD_ACTION, UPDATE_ERROR_LOADING_ACTION,
  UPDATE_LOADING_ACTION,
  UPDATE_LOADING_PERCENT_ACTION,
  UPDATE_SCORE_CARD_ACTION
} from '../actions/store.data.action';

import * as _ from 'lodash';
import {_ParseAST} from '@angular/compiler';


export function storeData(state: StoreData, action: any): StoreData {
    switch (action.type)  {

      // set all scorecards
      case ADD_SCORE_CARDS:
        const optionStore = _.cloneDeep( state );
        optionStore.scorecards = action.payload;
        return optionStore;

      // set one scorecard in store
      case ADD_SCORE_CARD:
        const addStore = _.cloneDeep( state );
        if (!_.find(addStore.scorecards, {id: action.payload.id})) {
          addStore.scorecards.push( action.payload );
        }
        return addStore;

      // set one scorecard in store
      case UPDATE_SCORE_CARD_ACTION:
        const updateStore = _.cloneDeep( state );
        updateStore.scorecards[_.findIndex(updateStore.scorecards, {id: action.payload.id })] = action.payload;
        return updateStore;

      // set one scorecard in store
      case DELETE_SCORE_CARD_ACTION:
        const deleteStore = _.cloneDeep( state );
        deleteStore.scorecards.splice(_.findIndex(deleteStore.scorecards, {id: action.payload }));
        return deleteStore;

      // set scorecard loading status
      case UPDATE_LOADING_ACTION:
        const loadingStore = _.cloneDeep( state );
        loadingStore.loadingScorecards = action.payload;
        return loadingStore;

      // set scorecard loading status
      case UPDATE_LOADING_PERCENT_ACTION:
        return <StoreData>{...state, loadingPercent: action.payload};

      // set scorecard loading status
      case SET_SELECTED_SCORE_CARD_ACTION:
        return <StoreData>{...state, selectedScorecard: action.payload};

      // set error status if something went wrong while loading scorecards
      case UPDATE_ERROR_LOADING_ACTION:
        const errorLoadingStore = _.cloneDeep( state );
        errorLoadingStore.errorloadingScorecards = action.payload;
        return errorLoadingStore;

      default:
        return state;
    }
}















