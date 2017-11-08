import {ScoreCard} from '../shared/models/scorecard';

export interface StoreData {
    scorecards: any[];
    selectedScorecard: ScoreCard;
    currentDeletedScorecard: string;
    loadingScorecards: boolean;
    loadingPercent: number;
    errorloadingScorecards: boolean;
    currentUser: any;
    options: any;
    orgunitNodes: any;
    selectedPeriod: any;
    selectedOrgunit: any;
    functions: any[];
    errorMessage: string;
    showPreview: boolean;
}

export const INITIAL_STORE_DATA: StoreData = {
    scorecards: [],
    selectedScorecard: null,
    currentDeletedScorecard: null,
    loadingScorecards: true,
    loadingPercent: 0,
    errorloadingScorecards: false,
    currentUser: null,
    options: null,
    orgunitNodes: null,
    selectedPeriod: '',
    selectedOrgunit: '',
    functions: [],
    errorMessage: '',
    showPreview: false
};
