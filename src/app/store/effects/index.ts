import { RouterEffects } from './router.effect';
import {UserEffect} from './user.effect';
import {ScorecardEffects} from './scorecard.effects';
import {MetadataEffects} from './metadata.effects';

export const effects: any[] = [ScorecardEffects, RouterEffects, UserEffect, MetadataEffects];

