import {Scorecard} from '../shared/models/scorecard';

export interface StoreData {
    scorecards: Scorecard[];
}

export const INITIAL_STORE_DATA: StoreData = {
   scorecards: []
};
