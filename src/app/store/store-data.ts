import {ScoreCard} from '../shared/models/scorecard';

export interface StoreData {
    scorecards: any[];
    selectedScorecard: ScoreCard;
    loadingScorecards: boolean;
    loadingPercent: number;
    errorloadingScorecards: boolean;
    currentUser: any;
    options: any;
    orgunitNodes: any;
    selectedPeriod: any;
    selectedOrgunit: any;
    functions: any[];
}

export const INITIAL_STORE_DATA: StoreData = {
  scorecards: [],
  selectedScorecard: null,
  loadingScorecards: true,
  loadingPercent: 0,
  errorloadingScorecards: false,
  currentUser: null,
  options: null,
  orgunitNodes: null,
  selectedPeriod: '',
  selectedOrgunit: '',
  functions: []
};
