import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ApplicationState } from '../../store/reducers';
import { Store } from '@ngrx/store';
import { ScoreCard } from '../../shared/models/scorecard';
import { Observable } from 'rxjs/Observable';
import { IndicatorHolder } from '../../shared/models/indicator-holder';
import { Legend } from '../../shared/models/legend';
import * as createActions from '../../store/actions/create.actions';
import * as _ from 'lodash';

@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./basic-details.component.css']
})
export class BasicDetailsComponent implements OnInit {
  @Input() additional_labels: any;
  @Input() indicator_holders: IndicatorHolder[] = [];
  @Input() legendset_definitions: Legend[] = [];
  @Input() header: any;
  @Output() onSave = new EventEmitter();

  show_delete_legend: boolean[] = [];
  show_add_legend = false;
  new_definition: '';
  new_color = '#fff';
  newLabel = '';

  // Objects to handling mutation on creation of score card
  header_object: any = {};
  legendset_definitions_array = [];

  @ViewChild('title', { static: true })
  title_element: ElementRef;

  @ViewChild('description', { static: true })
  discription_element: ElementRef;

  constructor(private store: Store<ApplicationState>) {}

  ngOnInit() {
    Object.keys(this.header).map(key => {
      this.header_object[key] = this.header[key];
    });
    this.legendset_definitions_array = _.map(
      this.legendset_definitions,
      legend => {
        const new_legend = { ...{}, ...legend };
        return new_legend;
      }
    );
  }

  //  remove a set of legend
  showDeleteWarnig(index) {
    if (this.indicator_holders.length === 0) {
      this.deleteLegand(index);
    } else {
      this.show_delete_legend[index] = true;
    }
  }

  updateHeader() {
    const header = { ...{}, ...this.header_object };
    this.store.dispatch(new createActions.SetHeader(header));
  }

  updateLegend() {
    const legends = _.map(this.legendset_definitions_array, legend => {
      const new_legend = { ...{}, ...legend };
      return new_legend;
    });
    this.store.dispatch(new createActions.SetLegend(legends));
  }

  deleteLegand(index) {
    const legend_sets = this.legendset_definitions_array.slice();
    const indicator_holders = this.indicator_holders.slice();
    legend_sets.splice(index, 1);
    this.show_delete_legend[index] = false;
    this.legendset_definitions_array = _.map(legend_sets, _.cloneDeep);
    //  loop through indicators and regenerate the legend set
    const holder_indicator_legends_obj = {};
    indicator_holders.forEach(holder => {
      holder.indicators.forEach(indicator => {
        const key = `${holder.holder_id}_${indicator.id}`;
        const legend_length = legend_sets.length - 2;
        const indicator_legend = [];
        let initial_value = 100;
        for (const legend of legend_sets) {
          if (!legend.hasOwnProperty('default')) {
            indicator_legend.push({
              color: legend.color,
              min: initial_value - Math.round(100 / legend_length),
              max: initial_value
            });
          }
          initial_value = initial_value - Math.round(100 / legend_length);
        }
        holder_indicator_legends_obj[key] = indicator_legend;
      });
    });
    // update indicator legend sets
    const updated_indicator_holders = _.map(indicator_holders, holder => {
      const indicators = _.map(holder.indicators, indicator => {
        const key = `${holder.holder_id}_${indicator.id}`;
        const legendset =
          holder_indicator_legends_obj[key] || indicator.legendset;
        return { ...indicator, legendset };
      });
      return { ...holder, indicators };
    });
    this.store.dispatch(new createActions.SetLegend(legend_sets));
    this.store.dispatch(
      new createActions.SetHolders(updated_indicator_holders)
    );
  }

  cancelDeleteLegend(index) {
    this.show_delete_legend[index] = false;
  }

  //  add a legend set
  showAddWarning() {
    if (this.indicator_holders.length === 0) {
      this.addLegend();
    } else {
      this.show_add_legend = true;
    }
  }

  addLegend() {
    const legends = this.legendset_definitions_array.slice();
    const indicator_holders = this.indicator_holders.slice();
    this.show_add_legend = false;
    const index = this.findFirstDefaultLegend();
    const new_legend = {
      color: this.new_color,
      definition: this.new_definition
    };
    legends.splice(index, 0, new_legend);
    this.legendset_definitions_array = _.map(legends, _.cloneDeep);
    this.new_color = '#fff';
    this.new_definition = '';
    //  loop through indicators and regenerate the legend set
    const holder_indicator_legends_obj = {};
    indicator_holders.forEach(holder => {
      holder.indicators.forEach(indicator => {
        const key = `${holder.holder_id}_${indicator.id}`;
        const legend_length = legends.length - 2;
        const indicator_legend = [];
        let initial_value = 100;
        for (const legend of legends) {
          if (!legend.hasOwnProperty('default')) {
            indicator_legend.push({
              color: legend.color,
              min: initial_value - Math.round(100 / legend_length),
              max: initial_value
            });
          }
          initial_value = initial_value - Math.round(100 / legend_length);
        }
        holder_indicator_legends_obj[key] = indicator_legend;
      });
    });

    // update indicator legend sets
    const updated_indicator_holders = _.map(indicator_holders, holder => {
      const indicators = _.map(holder.indicators, indicator => {
        const key = `${holder.holder_id}_${indicator.id}`;
        const legendset =
          holder_indicator_legends_obj[key] || indicator.legendset;
        return { ...indicator, legendset };
      });
      return { ...holder, indicators };
    });
    this.store.dispatch(new createActions.SetLegend(legends));
    this.store.dispatch(
      new createActions.SetHolders(updated_indicator_holders)
    );
  }

  cancelAddLegend() {
    this.show_add_legend = false;
  }

  findFirstDefaultLegend() {
    let i = 0;
    let index = 0;
    for (const item of this.legendset_definitions) {
      if (item.hasOwnProperty('default')) {
        index = i - 1;
      }
      i++;
    }
    return index;
  }

  addAditionalLabel() {
    const additional_labels = this.additional_labels.slice();
    const indicator_holders = this.indicator_holders.slice();
    if (this.newLabel !== '') {
      additional_labels.push(this.newLabel);
      for (const holder of indicator_holders) {
        for (let indicator of holder.indicators) {
          const additional_label_values = {
            ...{},
            ...indicator.additional_label_values
          };
          additional_label_values[this.newLabel] = '';
          indicator = { ...indicator, additional_label_values };
        }
      }
      this.newLabel = '';
    }
    this.store.dispatch(
      new createActions.SetAdditionalLabels(additional_labels)
    );
    this.store.dispatch(new createActions.SetHolders(indicator_holders));
  }

  deleteAdditionalLabel(label) {
    const additional_labels = this.additional_labels.slice();
    const indicator_holders = this.indicator_holders.slice();
    additional_labels.splice(additional_labels.indexOf(label), 1);
    for (const holder of indicator_holders) {
      for (let indicator of holder.indicators) {
        const additional_label_values = {
          ...{},
          ...indicator.additional_label_values
        };
        indicator = { ...indicator, ...additional_label_values };
      }
    }
    this.store.dispatch(
      new createActions.SetAdditionalLabels(additional_labels)
    );
    this.store.dispatch(new createActions.SetHolders(indicator_holders));
  }
}
