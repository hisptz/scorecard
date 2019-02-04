import { Action } from '@ngrx/store';
import { ScoreCard } from '../../shared/models/scorecard';

export const LOAD_SCORECARDS = '[Scorecard] Load Scorecards';
export const LOAD_SCORECARDS_FAIL = '[Scorecard] Load Scorecards Fail';
export const LOAD_SCORECARDS_COMPLETE = '[Scorecard] Load Scorecards Complete';
export const LOAD_SCORECARD_SUCCESS = '[Scorecard] Load Scorecards Success';
export const REMOVE_SCORECARD_SUCCESS = '[Scorecard] Remove Scorecard Success';

export class LoadScorecards implements Action {
  readonly type = LOAD_SCORECARDS;
}

export class LoadScorecardsFail implements Action {
  readonly type = LOAD_SCORECARDS_FAIL;
  constructor(public payload: any) {}
}

export class LoadScorecardSuccess implements Action {
  readonly type = LOAD_SCORECARD_SUCCESS;
  constructor(public payload: ScoreCard) {}
}

export class LoadScorecardsComplete implements Action {
  readonly type = LOAD_SCORECARDS_COMPLETE;
}

export class RemoveScorecardsSuccess implements Action {
  readonly type = REMOVE_SCORECARD_SUCCESS;
  constructor(public payload: ScoreCard) {}
}

export type Actions =
  LoadScorecards
  | LoadScorecardsFail
  | LoadScorecardSuccess
  | LoadScorecardsComplete
  | RemoveScorecardsSuccess;
