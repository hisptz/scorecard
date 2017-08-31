import {ScoreCard} from '../shared/models/scorecard';

export interface StoreData {
    scorecards: ScoreCard[];
    currentUser: any;
    options: any;
    orgunitNodes: any;
}

export const INITIAL_STORE_DATA: StoreData = {
  scorecards: [],
  currentUser: null,
  options: null,
orgunitNodes: null
};
