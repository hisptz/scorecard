import {ScoreCard} from '../shared/models/scorecard';

export interface StoreData {
    scorecards: ScoreCard[];
    currentUser: any;
}

export const INITIAL_STORE_DATA: StoreData = {
  scorecards: [],
  currentUser: null
};
