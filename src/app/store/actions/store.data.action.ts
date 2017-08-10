import {Action} from '@ngrx/store';
/**
 * Created by kelvin on 7/29/17.
 */
export const ADD_SCORE_CARDS = 'ADD_SCORE_CARDS';

export class AddScorecardsAction implements Action {
  type = ADD_SCORE_CARDS;
  constructor ( public payload: any ) {}
}
