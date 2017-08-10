import { StoreData } from '../store-data';
import {ADD_SCORE_CARDS} from '../actions/store.data.action';

import * as _ from 'lodash';


export function storeData(state: StoreData, action: any): StoreData {
    switch (action.type)  {

      case ADD_SCORE_CARDS:
        const optionStore = _.cloneDeep( state );
        optionStore.scorecards = action.payload;
        return optionStore;

      default:
        return state;
    }
}















