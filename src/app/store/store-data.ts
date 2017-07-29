import {ScoreCard} from '../shared/models/scorecard';

export interface StoreData {
    scorecards: ScoreCard[];
}

export const INITIAL_STORE_DATA: StoreData = {
   scorecards: []
};
