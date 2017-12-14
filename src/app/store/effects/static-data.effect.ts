import { Injectable } from '@angular/core';
import {Actions} from "@ngrx/effects";
import {ScorecardService} from "../../shared/services/scorecard.service";
import {DataService} from "../../shared/services/data.service";

@Injectable()
export class StaticDataEffect {
  constructor(
    private actions$: Actions,
    private dataService: DataService,
    private functionService: Fun
  ) {  }
}
