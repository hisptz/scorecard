import {createSelector} from '@ngrx/store';
import {getUserState} from '../reducers/index';
import * as fromUser from '../reducers/user.reducer';

export const getUser = createSelector(getUserState, fromUser.getUser);
export const getUserLoaded = createSelector(getUserState, fromUser.getUserLoaded);
