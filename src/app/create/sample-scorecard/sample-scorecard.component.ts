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
import { ScoreCard } from '../../shared/models/scorecard';
import { UserGroup } from '../../shared/models/user-group';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../store/reducers';
import { IndicatorHolder } from '../../shared/models/indicator-holder';
import { IndicatorHolderGroup } from '../../shared/models/indicator-holders-group';
import { Observable } from 'rxjs/Observable';
import * as orgunitSelector from '../../store/selectors/orgunits.selectors';
import * as dataSelector from '../../store/selectors/static-data.selectors';
import * as createSelector from '../../store/selectors/create.selectors';
import { ScorecardService } from '../../shared/services/scorecard.service';
import * as createActions from '../../store/actions/create.actions';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { take } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-sample-scorecard',
  templateUrl: './sample-scorecard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sample-scorecard.component.css'],
  animations: [
    trigger('fadeOut', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition(':enter', [
        style({ opacity: 0.2, transform: 'scale(0)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('fadeOut1', [
      state('void', style({ opacity: 0.2, transform: 'scale(0)' })),
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition(
        ':enter',
        animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ),
      transition(
        ':leave',
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0)' }))
      )
    ])
  ]
})
export class SampleScorecardComponent implements OnInit, OnChanges {
  @Input() scorecard: ScoreCard;
  @Input() current_indicator: IndicatorHolder = null;
  @Input() current_holder_group: IndicatorHolderGroup = null;
  @Input() indicator_holders: IndicatorHolder[] = [];
  @Input() indicator_holder_groups: IndicatorHolderGroup[] = [];
  @Input() additional_labels: any = [];
  @Input() legendset_definitions: any = [];
  @Input() group_type = '';
  @Input() active_group = '';
  @Output() onSharing = new EventEmitter();
  @Output() onPeriodUpdate = new EventEmitter();
  @Output() onOrgUnitUpdate = new EventEmitter();

  user_groups$: Observable<UserGroup[]>;
  selected_user_groups$: Observable<any>;
  group_loading$: Observable<boolean>;
  orgunit_loading$: Observable<boolean>;
  holders_list$: Observable<IndicatorHolder[]>;
  need_for_group$: Observable<boolean>;
  need_for_indicator$: Observable<boolean>;
  deleting: string[] = [];

  indicator_holder_groups_updated = [];

  group_loading = false;
  constructor(
    private store: Store<ApplicationState>,
    private scorecardService: ScorecardService
  ) {
    this.orgunit_loading$ = store.select(orgunitSelector.getOrgunitLoading);
    this.user_groups$ = store.select(dataSelector.getUserGroups);
    this.group_loading$ = store.select(dataSelector.getUserGroupsLoaded);
    this.holders_list$ = store.select(createSelector.getHoldersList);
    this.need_for_group$ = store.select(createSelector.getNeedForGroup);
    this.need_for_indicator$ = store.select(createSelector.getNeedForIndicator);
    this.selected_user_groups$ = store.select(createSelector.getUserGroups);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes &&
      changes.indicator_holder_groups &&
      changes.indicator_holder_groups.currentValue
    ) {
      this.indicator_holder_groups_updated = _.map(
        changes.indicator_holder_groups.currentValue,
        _.cloneDeep
      );
    }
  }

  updatePeriod(event) {
    if (event) {
      this.store.dispatch(new createActions.SetPeriodType(event.type));
      this.store.dispatch(new createActions.SetSelectedPeriod(event.items));
    }
    this.onPeriodUpdate.emit(event);
  }

  updateOrgUnitModel(event) {
    this.store.dispatch(new createActions.SetOrgunitSettings(event));
    this.onOrgUnitUpdate.emit(event);
  }

  updateGroup(event) {
    this.store.dispatch(new createActions.SetUserGroups(event));
  }

  //  this will enable updating of indicator
  updateIndicator(indicator: any): void {
    this.scorecardService.setCurrentIndicator(
      indicator,
      this.indicator_holder_groups,
      this.indicator_holders
    );
  }

  enableAddIndicator(current_id: any = null) {
    this.scorecardService.enableAddIndicator(
      this.indicator_holders,
      this.indicator_holder_groups,
      this.current_holder_group,
      current_id
    );
  }

  deleteGroup(group) {
    this.scorecardService.deleteGroup(
      group,
      this.indicator_holders,
      this.indicator_holder_groups
    );
  }

  updateGroupName() {
    this.indicator_holder_groups = _.map(
      this.indicator_holder_groups_updated,
      _.cloneDeep
    );
    this.store.dispatch(
      new createActions.SetHoldersGroups(this.indicator_holder_groups)
    );
  }

  // TODO: change implementation to use lodash
  getIndicatorLabel(indicator, label) {
    const labels = [];
    for (const data of indicator.indicators) {
      if (
        data.additional_label_values[label] !== null &&
        data.additional_label_values[label] !== ''
      ) {
        labels.push(data.additional_label_values[label]);
      }
    }
    return labels.join(' / ');
  }

  //  assign a background color to area depending on the legend set details
  assignBgColor(object, value): string {
    let color = '#BBBBBB';
    for (const data of object.legendset) {
      if (data.max === '-') {
        if (parseInt(value, 10) >= parseInt(data.min, 10)) {
          color = data.color;
        }
      } else {
        if (
          parseInt(value, 10) >= parseInt(data.min, 10) &&
          parseInt(value, 10) <= parseInt(data.max, 10)
        ) {
          color = data.color;
        }
      }
    }
    return color;
  }

  //  simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string {
    return _.map(holder.indicators, (indicator: any) => indicator.title).join(
      ' / '
    );
  }

  // enabling creating of group
  createGroup(): void {
    const current_holder_group_id =
      this.scorecardService.getStartingGroupHolderId(
        this.indicator_holder_groups
      ) + 1;
    const current_holder_group = {
      id: current_holder_group_id,
      name: 'New Group',
      indicator_holder_ids: [],
      background_color: '#ffffff',
      holder_style: null
    };
    this.store.dispatch(
      new createActions.SetCurrentGroup(current_holder_group)
    );
    this.scorecardService.enableAddIndicator(
      this.indicator_holders,
      this.indicator_holder_groups,
      current_holder_group
    );
  }

  deleteHolder(holder_to_delete) {
    const indicator_holder_groups = this.indicator_holder_groups.slice();
    indicator_holder_groups.forEach((group, holder_index) => {
      group.indicator_holder_ids.forEach((holder, indicator_index) => {
        if (holder === holder_to_delete.holder_id) {
          group.indicator_holder_ids.splice(indicator_index, 1);
        }
      });
    });
    return indicator_holder_groups;
  }

  insertHolder(
    indicator_holder_groups_list,
    holder_to_insert,
    current_holder,
    num: number
  ) {
    const indicator_holder_groups = indicator_holder_groups_list.slice();
    indicator_holder_groups.forEach((group, holder_index) => {
      group.indicator_holder_ids.forEach((holder, indicator_index) => {
        if (
          holder === current_holder.holder_id &&
          group.indicator_holder_ids.indexOf(holder_to_insert.holder_id) === -1
        ) {
          group.indicator_holder_ids.splice(
            indicator_index + num,
            0,
            holder_to_insert.holder_id
          );
        }
      });
    });
    this.store.dispatch(
      new createActions.SetHoldersGroups(indicator_holder_groups)
    );
    this.scorecardService.cleanUpEmptyColumns(
      this.indicator_holders,
      indicator_holder_groups
    );
  }

  getHolderById(holder_id) {
    let return_id = null;
    for (const holder of this.indicator_holders) {
      if (holder.holder_id === holder_id) {
        return_id = holder;
        break;
      }
    }
    return return_id;
  }

  deleteEmptyGroups() {
    const indicator_holder_groups = this.indicator_holder_groups.slice();
    indicator_holder_groups.forEach((group, groupIndex) => {
      if (group.indicator_holder_ids.length === 0) {
        indicator_holder_groups.splice(groupIndex, 1);
      }
    });
    this.store.dispatch(
      new createActions.SetHoldersGroups(indicator_holder_groups)
    );
  }

  getgroupById(group_id) {
    let return_id = null;
    for (const group of this.indicator_holder_groups) {
      if (group.id === group_id) {
        return_id = group;
        break;
      }
    }
    return return_id;
  }

  //  Dertimine if indicators are in the same group and say whether the first is larger of not
  getHolderPosition(holder_to_check, current_holder) {
    let holders_in_same_group = false;
    let holder_group = null;
    let increment_number = 0;
    this.indicator_holder_groups.forEach((group, holder_index) => {
      if (
        group.indicator_holder_ids.indexOf(holder_to_check.holder_id) !== -1 &&
        group.indicator_holder_ids.indexOf(current_holder.holder_id) !== -1
      ) {
        holders_in_same_group = true;
        holder_group = group.indicator_holder_ids;
      }
    });
    if (holders_in_same_group) {
      if (
        holder_group.indexOf(holder_to_check.holder_id) >
        holder_group.indexOf(current_holder.holder_id)
      ) {
        increment_number = 0;
      } else {
        increment_number = 1;
      }
    }
    return increment_number;
  }

  // this will be invoked after a success drop of item
  transferDataSuccess($event, drop_area: string, object: any) {
    if (drop_area === 'group') {
      //  check if someone is trying to reorder items within the scorecard

      if ($event.dragData.hasOwnProperty('holder_id')) {
        const last_holder =
          object.indicator_holder_ids.length === 0
            ? 0
            : object.indicator_holder_ids.length - 1;
        if (
          object.indicator_holder_ids.indexOf($event.dragData.holder_id) === -1
        ) {
          const indicator_holder_groups_list = this.deleteHolder(
            $event.dragData
          );
          this.insertHolder(
            indicator_holder_groups_list,
            $event.dragData,
            this.getHolderById(object.indicator_holder_ids[last_holder]),
            1
          );
          this.updateIndicator($event.dragData);
        } else {
        }
        this.deleteEmptyGroups();
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
        if ($event.dragData.id !== object.id) {
          this.indicator_holder_groups.forEach((group, group_index) => {
            if (group.id === $event.dragData.id) {
              this.indicator_holder_groups.splice(group_index, 1);
            }
          });
          this.indicator_holder_groups.forEach((group, group_index) => {
            if (
              group.id === object.id &&
              this.getgroupById($event.dragData.id) === null
            ) {
              this.indicator_holder_groups.splice(
                group_index,
                0,
                $event.dragData
              );
            }
          });
          this.store.dispatch(
            new createActions.SetHoldersGroups(
              this.indicator_holder_groups.slice()
            )
          );
        }
      } else {
        const last_holder_position =
          object.indicator_holder_ids.length === 0
            ? 0
            : object.indicator_holder_ids.length - 1;
        this.updateIndicator(
          this.getHolderById(object.indicator_holder_ids[last_holder_position])
        );

        setTimeout(() => {
          this.enableAddIndicator(this.current_indicator.holder_id);
          this.scorecardService.load_item(
            $event.dragData,
            this.indicator_holders,
            this.indicator_holder_groups,
            this.current_indicator,
            this.current_holder_group,
            this.legendset_definitions,
            this.additional_labels,
            this.group_type,
            this.active_group
          );
        }, 20);
      }
    } else if (drop_area === 'table_data') {
      //  check if someone is trying to reorder items within the scorecard
      if ($event.dragData.hasOwnProperty('holder_id')) {
        if ($event.dragData.holder_id === object.holder_id) {
        } else {
          const position = this.getHolderPosition($event.dragData, object);
          const indicator_holder_groups_list = this.deleteHolder(
            $event.dragData
          );
          this.insertHolder(
            indicator_holder_groups_list,
            $event.dragData,
            object,
            position
          );
          this.updateIndicator($event.dragData);
        }
        this.deleteEmptyGroups();
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
      } else {
        this.updateIndicator(object);
        this.enableAddIndicator(this.current_indicator.holder_id);
        this.scorecardService.load_item(
          $event.dragData,
          this.indicator_holders,
          this.indicator_holder_groups,
          this.current_indicator,
          this.current_holder_group,
          this.legendset_definitions,
          this.additional_labels,
          this.group_type,
          this.active_group,
          false,
          true
        );
      }
    } else if (drop_area === 'new-group') {
      this.createGroup();

      if ($event.dragData.hasOwnProperty('holder_id')) {
        const last_holder =
          this.getgroupById(this.current_holder_group.id).indicator_holder_ids
            .length === 0
            ? 0
            : this.getgroupById(this.current_holder_group.id)
                .indicator_holder_ids.length - 1;
        if (
          this.getgroupById(
            this.current_holder_group.id
          ).indicator_holder_ids.indexOf($event.dragData.holder_id) === -1
        ) {
          const indicator_holder_groups_list = this.deleteHolder(
            $event.dragData
          );
          this.insertHolder(
            indicator_holder_groups_list,
            $event.dragData,
            this.getHolderById(
              this.getgroupById(this.current_holder_group.id)
                .indicator_holder_ids[last_holder]
            ),
            1
          );
          this.updateIndicator($event.dragData);
        } else {
        }
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
      } else {
        setTimeout(() => {
          this.scorecardService.load_item(
            $event.dragData,
            this.indicator_holders,
            this.indicator_holder_groups,
            this.current_indicator,
            this.current_holder_group,
            this.legendset_definitions,
            this.additional_labels,
            this.group_type,
            this.active_group
          );
        }, 20);
      }
    } else {
      if ($event.dragData.hasOwnProperty('holder_id')) {
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
      } else {
        this.enableAddIndicator(this.current_indicator.holder_id);
        this.scorecardService.load_item(
          $event.dragData,
          this.indicator_holders,
          this.indicator_holder_groups,
          this.current_indicator,
          this.current_holder_group,
          this.legendset_definitions,
          this.additional_labels,
          this.group_type,
          this.active_group
        );
      }
    }
  }

  trackItem(index, item) {
    return item && item.id ? item.id : index;
  }

  trackItemId(index, item) {
    return item && item.holder_id ? item.holder_id : index;
  }

  onUpdateIndicatorLabelValue(e, holder: any, label: string) {
    e.stopPropagation();

    this.holders_list$.pipe(take(1)).subscribe((holderList: any[]) => {
      const currentHolder = _.find(holderList, ['holder_id', holder.holder_id]);

      const holderIndex = holderList.indexOf(currentHolder);

      if (holderIndex !== -1) {
        const newHolder = {
          ...currentHolder,
          indicators: currentHolder.indicators.map(
            (indicator: any, indicatorIndex: number) => {
              if (indicatorIndex === 0) {
                return {
                  ...indicator,
                  additional_label_values: {
                    ...indicator.additional_label_values,
                    [label]: e.target.value
                  }
                };
              }

              return indicator;
            }
          )
        };

        this.holders_list$ = of([
          ..._.slice(holderList, 0, holderIndex),
          newHolder,
          ..._.slice(holderList, holderIndex + 1)
        ]);
      }
    });
  }
}
