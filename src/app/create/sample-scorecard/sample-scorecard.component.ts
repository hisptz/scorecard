import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScoreCard} from '../../shared/models/scorecard';
import {UserGroup} from '../../shared/models/user-group';
import * as _ from 'lodash';
import {Store} from "@ngrx/store";
import {ApplicationState} from "../../store/reducers";
import {IndicatorHolder} from "../../shared/models/indicator-holder";
import {IndicatorHolderGroup} from "../../shared/models/indicator-holders-group";

@Component({
  selector: 'app-sample-scorecard',
  templateUrl: './sample-scorecard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sample-scorecard.component.css']
})
export class SampleScorecardComponent implements OnInit {

  @Input() scorecard: ScoreCard;
  @Input() userGroups: UserGroup[] = [];
  @Input() need_for_group: boolean = false;
  @Input() need_for_indicator: boolean = false;
  @Input() current_indicator: IndicatorHolder = null;
  @Input() current_holder_group: IndicatorHolderGroup = null;
  @Input() holders_list: IndicatorHolder[] = [];
  @Output() onSharing = new EventEmitter();
  @Output() onPeriodUpdate = new EventEmitter();
  @Output() onOrgUnitUpdate = new EventEmitter();
  constructor(private store: Store<ApplicationState>) {

  }

  ngOnInit() {
  }

  transferDataSuccess(event, type, item) {
    console.log(event);
  }

  updatePeriod(event) {
    this.onPeriodUpdate.emit(event);
  }

  updateOrgUnitModel(event) {
    this.onOrgUnitUpdate.emit(event);
  }

  //  this will enable updating of indicator
  updateIndicator(indicator: any): void {

  }

  // TODO: change implementation to use lodash
  getItemsFromGroups(): any[] {
    const indicators_list = [];
    for (const data of this.scorecard.data.data_settings.indicator_holder_groups ) {
      for ( const holders_list of data.indicator_holder_ids ) {
        for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
          if (holder.holder_id === holders_list) {
            indicators_list.push(holder);
          }
        }
      }
    }
    return indicators_list;
  }

  // TODO: change implementation to use lodash
  getIndicatorLabel(indicator, label) {
    const labels = [];
    for ( const data of indicator.indicators ) {
      if (data.additional_label_values[label] !== null && data.additional_label_values[label] !== '') {
        labels.push(data.additional_label_values[label]);
      }
    }
    return labels.join(' / ');
  }

  //  assign a background color to area depending on the legend set details
  assignBgColor(object, value): string {
    let color = '#BBBBBB';
    for ( const data of object.legendset ) {
      if (data.max === '-') {

        if (parseInt(value) >= parseInt(data.min) ) {
          color = data.color;
        }
      }else {
        if (parseInt(value) >= parseInt(data.min) && parseInt(value) <= parseInt(data.max)) {
          color = data.color;
        }
      }
    }
    return color;
  }

  //  simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string {
    return _.map(holder.indicators, (indicator: any) => indicator.title).join(' / ');
  }

  // enabling creating of group
  createGroup(): void {
    const current_holder_group_id = this.scorecard.data.data_settings.indicator_holders.length + 1;
    this.current_holder_group = {
      'id': current_holder_group_id,
      'name': 'New Group',
      'indicator_holder_ids': [],
      'background_color': '#ffffff',
      'holder_style': null
    };
    // this.enableAddIndicator();
  }
}
