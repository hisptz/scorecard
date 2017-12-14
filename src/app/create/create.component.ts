import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { Store} from '@ngrx/store';
import { ApplicationState } from '../store/reducers';
import * as createActions from '../store/actions/create.actions';
import * as createSelectors from '../store/selectors/create.selectors';
import { Observable } from 'rxjs/Observable';
import { ScoreCard } from '../shared/models/scorecard';
import {Back, Go} from '../store/actions/router.action';
import {IndicatorHolder} from '../shared/models/indicator-holder';
import {IndicatorHolderGroup} from '../shared/models/indicator-holders-group';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  scorecard$: Observable<ScoreCard>;
  current_indicator_holder$: Observable<IndicatorHolder>;
  current_holder_group$: Observable<IndicatorHolderGroup>;
  next_indicator_holder_id$: Observable<number>;
  next_holder_group_id$: Observable<number>;
  need_for_indicator$: Observable<boolean>;
  need_for_group$: Observable<boolean>;
  holder_list$: Observable<IndicatorHolder[]>
  constructor(private store: Store<ApplicationState>) {
    this.store.dispatch(new createActions.GetScorecardToCreate());
    this.scorecard$ = this.store.select(createSelectors.getScorecardToCreate);
    this.current_indicator_holder$ = this.store.select(createSelectors.getCurrentIndicatorHolder);
    this.current_holder_group$ = this.store.select(createSelectors.getCurrentGroup);
    this.next_indicator_holder_id$ = this.store.select(createSelectors.getNextHolderId);
    this.next_holder_group_id$ = this.store.select(createSelectors.getNextGroupId);
    this.need_for_indicator$ = this.store.select(createSelectors.getNeedForIndicator);
    this.need_for_group$ = this.store.select(createSelectors.getNeedForGroup);
    this.holder_list$ = this.store.select(createSelectors.getHoldersList);
  }

  ngOnInit() {
  }

  goToHomePage() {
    this.store.dispatch(new Go({path: ['']}));
  }

  cancelSaving() {
    this.store.dispatch(new Back());
  }

  saveScorecard() {
    console.log('Save scorecard');
  }

}
