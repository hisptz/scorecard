import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ScorecardService } from '../../shared/services/scorecard.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../store/reducers';
import { Observable } from 'rxjs/Observable';
import * as createSelector from '../../store/selectors/create.selectors';
import * as createActions from '../../store/actions/create.actions';
import * as _ from 'lodash';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit, OnChanges {
  @Input() current_indicator_holder;
  @Input() scorecard;
  @Input() indicator_holders;
  @Input() indicator_holder_groups;
  @Input() legendset_definitions;
  @Input() additional_labels;
  @Output() onShowBottleneckEditor = new EventEmitter();

  show_score$: Observable<boolean>;
  current_holder_id = '';

  current_indicator_holder_indicators = [];
  constructor(
    private scorecardService: ScorecardService,
    private store: Store<ApplicationState>
  ) {
    this.show_score$ = store.select(createSelector.getShowScore);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.current_holder_id = changes.current_indicator_holder
      ? changes.current_indicator_holder.currentValue.holder_id
      : this.current_holder_id;
    if (
      this.current_holder_id &&
      changes.indicator_holders &&
      changes.indicator_holders.currentValue
    ) {
      const updated_indicator_holder: any = _.find(
        changes.indicator_holders.currentValue,
        {
          holder_id: this.current_indicator_holder.holder_id
        }
      );
      if (updated_indicator_holder && updated_indicator_holder.indicators) {
        this.current_indicator_holder_indicators = _.map(
          _.map(updated_indicator_holder.indicators, _.cloneDeep),
          indicator => {
            const new_indicator = { ...{}, ...indicator };
            return new_indicator;
          }
        );
      }
    }
  }

  deleteIndicator(indicator) {
    this.scorecardService.deleteIndicator(
      indicator,
      this.indicator_holders,
      this.indicator_holder_groups
    );
  }

  showBotleneckEditor(indicator) {
    if (!indicator.hasOwnProperty('use_bottleneck_groups')) {
      indicator.use_bottleneck_groups =
        indicator.bottleneck_indicators.length === 0 ? true : false;
    }
    if (!indicator.hasOwnProperty('bottleneck_indicators_groups')) {
      indicator.bottleneck_indicators_groups = [];
    }
    this.onShowBottleneckEditor.emit(indicator);
  }

  updateIndicatorDetails(indicator: any) {
    const indicator_holders = _.map(this.indicator_holders, _.cloneDeep);
    const updated_indicator_holder: any = _.find(indicator_holders, {
      holder_id: this.current_indicator_holder.holder_id
    });
    const updated_indicator_holder_index = _.findIndex(indicator_holders, {
      holder_id: this.current_indicator_holder.holder_id
    });
    const updated_indicator_index = _.findIndex(
      updated_indicator_holder.indicators,
      { id: indicator.id }
    );
    updated_indicator_holder.indicators.splice(
      updated_indicator_index,
      1,
      indicator
    );
    indicator_holders.splice(
      updated_indicator_holder_index,
      1,
      updated_indicator_holder
    );
    this.indicator_holders = _.map(indicator_holders, _.cloneDeep);
    this.store.dispatch(new createActions.SetHolders(indicator_holders));
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }
}
