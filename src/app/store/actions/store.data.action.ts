import {Action} from '@ngrx/store';
import {ScoreCard} from '../../shared/models/scorecard';
/**
 * Created by kelvin on 7/29/17.
 */
export const ADD_SCORE_CARDS = 'ADD_SCORE_CARDS';
export const ADD_SCORE_CARD = 'ADD_SCORE_CARD';
export const UPDATE_SCORE_CARD_ACTION = 'UPDATE_SCORE_CARD_ACTION';
export const DELETE_SCORE_CARD_ACTION = 'DELETE_SCORE_CARD_ACTION';
export const UPDATE_LOADING_ACTION = 'UPDATE_LOADING_ACTION';
export const UPDATE_LOADING_PERCENT_ACTION = 'UPDATE_LOADING_PERCENT_ACTION';
export const UPDATE_ERROR_LOADING_ACTION = 'UPDATE_ERROR_LOADING_ACTION';

export class UpdateLoadingAction implements Action {
  type = UPDATE_LOADING_ACTION;
  constructor ( public payload: boolean ) {}
}

export class UpdateLoadingPercentAction implements Action {
  type = UPDATE_LOADING_PERCENT_ACTION;
  constructor ( public payload: number ) {}
}

export class UpdateErrorLoadingAction implements Action {
  type = UPDATE_ERROR_LOADING_ACTION;
  constructor ( public payload: boolean ) {}
}
export class AddScorecardsAction implements Action {
  type = ADD_SCORE_CARDS;
  constructor ( public payload: any ) {}
}

export class AddScorecardAction implements Action {
  type = ADD_SCORE_CARD;
  constructor ( public payload: any ) {}
}

export class UpdateScorecardAction implements Action {
  type = UPDATE_SCORE_CARD_ACTION;
  constructor ( public payload: any ) {}
}

export class DeleteScorecardAction implements Action {
  type = DELETE_SCORE_CARD_ACTION;
  constructor ( public payload: any ) {}
}
