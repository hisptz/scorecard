import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../../store/reducers';
import {Observable} from 'rxjs/Observable';
import * as createSelector from '../../store/selectors/create.selectors';
import * as createActions from '../../store/actions/create.actions';
import * as _ from 'lodash';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {

  @Input() current_indicator_holder;
  @Input() scorecard;
  @Input() indicator_holders;
  @Input() indicator_holder_groups;
  @Input() legendset_definitions;
  @Input() additional_labels;
  @Output() onShowBottleneckEditor = new EventEmitter();

  show_score$: Observable<boolean>;
  constructor(
    private scorecardService: ScorecardService,
    private store: Store<ApplicationState>
  ) {
    this.show_score$ = store.select(createSelector.getShowScore);
  }

  ngOnInit() {
  }

  deleteIndicator(indicator) {
    this.scorecardService.deleteIndicator(indicator, this.indicator_holders, this.indicator_holder_groups);
  }

  showBotleneckEditor(indicator) {
    if (!indicator.hasOwnProperty('use_bottleneck_groups')) {
      indicator.use_bottleneck_groups = indicator.bottleneck_indicators.length === 0 ? true : false;
    }
    if (!indicator.hasOwnProperty('bottleneck_indicators_groups')) {
      indicator.bottleneck_indicators_groups = [];
    }
    this.onShowBottleneckEditor.emit(indicator);
  }

  updateIndicatorDetails(indicator) {
    const indicator_holders = this.indicator_holders;
    const updated_indicator_holder = _.find(this.indicator_holders, {'holder_id': this.current_indicator_holder.holder_id});
    const updated_indicator_holder_index = _.findIndex(this.indicator_holders, {'holder_id': this.current_indicator_holder.holder_id});
    const updated_indicator_index = _.findIndex(updated_indicator_holder.indicators, {id: indicator.id});
    updated_indicator_holder.indicators.splice(updated_indicator_index, 1, indicator);
    indicator_holders.splice(updated_indicator_holder_index, 1, updated_indicator_holder);
    this.store.dispatch(new createActions.SetHolders(indicator_holders));
  }
}
