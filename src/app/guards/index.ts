import {ScorecardExistsGuards} from './scorecards.exisit';
import {UserExistsGuards} from './user.exists';

export const guards: any[] = [ScorecardExistsGuards, UserExistsGuards];

export * from './scorecards.exisit';
