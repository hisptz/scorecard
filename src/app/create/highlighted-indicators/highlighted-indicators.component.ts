import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  animate,
  group,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { ScoreCard } from '../../shared/models/scorecard';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ScorecardService } from '../../shared/services/scorecard.service';
import { IndicatorGroupService } from '../../shared/services/indicator-group.service';
import { DatasetService } from '../../shared/services/dataset.service';
import { ApplicationState } from '../../store/reducers';
import { Store } from '@ngrx/store';
import { EventDataService } from '../../shared/services/event-data.service';
import { ProgramIndicatorsService } from '../../shared/services/program-indicators.service';
import { DataElementGroupService } from '../../shared/services/data-element-group.service';
import { getFunctions } from '../../store/selectors/static-data.selectors';
import * as _ from 'lodash';
import {
  SetHighlightedIndicator,
  SetHighlightedIndicatorOu
} from '../../store/actions/create.actions';

@Component({
  selector: 'app-highlighted-indicators',
  templateUrl: './highlighted-indicators.component.html',
  styleUrls: ['./highlighted-indicators.component.css'],
  animations: [
    trigger('groupFade', [
      state('void', style({ opacity: 0.2 })),
      transition(':enter', [
        style({ opacity: 0.5, transform: 'scale(0.7)' }),
        group([
          animate(
            '300ms 100ms ease-out',
            style({ opacity: 1, transform: 'scale(1)' })
          )
        ])
      ]),
      transition(':leave', [
        style({ opacity: 0.9, transform: 'scale(1)' }),
        group([
          animate(
            '300ms 100ms ease-out',
            style({ opacity: 0, transform: 'scale(0)' })
          )
        ])
      ])
    ]),
    trigger('fadeOut', [
      state('void', style({ opacity: 0.6 })),
      transition(':enter', animate('300ms ease-in'))
    ]),
    trigger('hiddenItem', [
      state(
        'notHidden',
        style({
          transform: 'scale(1, 1)'
        })
      ),
      state(
        'hidden',
        style({
          transform: 'scale(0.0, 0.00)',
          visibility: 'hidden',
          height: '0px'
        })
      ),
      transition('notHidden <=> hidden', animate('300ms'))
    ])
  ]
})
export class HighlightedIndicatorsComponent implements OnInit, OnChanges {
  @Input() scorecard: ScoreCard;
  @Input() highlighted_indicators: any[] = [];
  @Input() legendset_definitions: any[] = [];
  @Output() onCancelHighlightedEditor = new EventEmitter();

  highlighted_indicators_array = [];
  datasets: any[] = [];
  indicatorGroups: any[] = [];
  dataElementGroups: any[] = [];
  programs: any[] = [];
  events: any[] = [];
  functions: any = [];
  current_groups: any[];
  current_listing: any[] = [];
  current_listing$: Observable<any[]>;
  activeGroup: string = null;
  group_type = 'indicators';
  listReady = false;
  listQuery: string = null;
  groupQuery: string = null;
  done_loading_groups = false;
  done_loading_list = false;
  error_loading_groups: any = { occurred: false, message: '' };
  error_loading_list: any = { occurred: false, message: '' };
  _current_groups$ = new BehaviorSubject([]);
  _current_listing$ = new BehaviorSubject([]);
  _done_loading_groups$ = new BehaviorSubject(false);
  _done_loading_list$ = new BehaviorSubject(false);
  _error_loading_groups$ = new BehaviorSubject({
    occurred: false,
    message: ''
  });
  _error_loading_list$ = new BehaviorSubject({ occurred: false, message: '' });
  dataset_types = [
    { id: '.REPORTING_RATE', name: 'Reporting Rate' },
    { id: '.REPORTING_RATE_ON_TIME', name: 'Reporting Rate on time' },
    { id: '.ACTUAL_REPORTS', name: 'Actual Reports Submitted' },
    { id: '.ACTUAL_REPORTS_ON_TIME', name: 'Reports Submitted on time' },
    { id: '.EXPECTED_REPORTS', name: 'Expected Reports' }
  ];
  p: number;
  r: number;
  k: number;
  constructor(
    private scorecardService: ScorecardService,
    private indicatorService: IndicatorGroupService,
    private datasetService: DatasetService,
    private dataElementService: DataElementGroupService,
    private programService: ProgramIndicatorsService,
    private eventService: EventDataService,
    private store: Store<ApplicationState>
  ) {
    this.initiateItems();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.highlighted_indicators) {
      this.highlighted_indicators_array = _.map(
        this.highlighted_indicators,
        _.cloneDeep
      );
    }
  }

  // deal with all issues during group type switching between dataelent, indicators and datasets
  switchType(current_type): void {
    this.listReady = false;
    this.groupQuery = null;
    if (current_type === 'indicators') {
      this.setList(current_type, this.indicatorGroups);
    } else if (current_type === 'dataElements') {
      this.setList(current_type, this.dataElementGroups);
    } else if (current_type === 'datasets') {
      this.setList(current_type, this.dataset_types);
    } else if (current_type === 'programs') {
      this.setList(current_type, this.programs);
    } else if (current_type === 'event') {
      this.setList(current_type, this.programs);
    } else if (current_type === 'functions') {
      this.setList(current_type, this.functions);
    } else {
    }
  }

  setList(type, groups) {
    this._current_groups$.next(groups);
    if (groups.length !== 0) {
      this.load_list(groups[0], type);
    }
  }

  // load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_list(selectedGroup, current_type): void {
    const group_id = selectedGroup.id;
    this.listQuery = null;
    this.activeGroup = group_id;
    this.listReady = true;
    this._current_listing$.next([]);
    this._done_loading_list$.next(true);
    if (current_type === 'indicators') {
      let load_new = false;
      for (const indicatorGroup of this.indicatorGroups) {
        if (indicatorGroup.id === group_id) {
          if (indicatorGroup.indicators.length !== 0) {
            this._current_listing$.next(indicatorGroup.indicators);
            this._done_loading_list$.next(true);
          } else {
            load_new = true;
          }
        }
      }
      if (load_new) {
        this.indicatorService.load(group_id).subscribe(
          indicators => {
            this._current_listing$.next(indicators.indicators);
            this._done_loading_list$.next(true);
            for (const indicatorGroup of this.indicatorGroups) {
              if (indicatorGroup.id === group_id) {
                indicatorGroup.indicators = indicators.indicators;
              }
            }
          },
          error => {
            this._error_loading_list$.next({
              occurred: true,
              message: 'Something went wrong when trying to load Indicators'
            });
          }
        );
      }
    } else if (current_type === 'dataElements') {
      let load_new = false;
      for (const dataElementGroup of this.dataElementGroups) {
        if (dataElementGroup.id === group_id) {
          if (dataElementGroup.dataElements.length !== 0) {
            this._current_listing$.next(dataElementGroup.dataElements);
            this._done_loading_list$.next(true);
          } else {
            load_new = true;
          }
        }
      }
      if (load_new) {
        this.dataElementService.load(group_id).subscribe(
          dataElements => {
            this._current_listing$.next(dataElements.dataElements);
            this._done_loading_list$.next(true);
            for (const dataElementGroup of this.dataElementGroups) {
              if (dataElementGroup.id === group_id) {
                dataElementGroup.dataElements = dataElements.dataElements;
              }
            }
          },
          error => {
            this._error_loading_list$.next({
              occurred: true,
              message: 'Something went wrong when trying to load Indicators'
            });
          }
        );
      }
    } else if (current_type === 'datasets') {
      const current_listing = [];
      let group_name = '';
      for (const dataset_group of this.dataset_types) {
        if (dataset_group.id === group_id) {
          group_name = dataset_group.name;
        }
      }
      for (const dataset of this.datasets) {
        current_listing.push({
          id: dataset.id + group_id,
          name: group_name + ' ' + dataset.name
        });
      }
      this._current_listing$.next(current_listing);
      this.listReady = true;
      this._done_loading_list$.next(true);
      this.listQuery = null;
    } else if (current_type === 'programs') {
      let load_new = false;
      for (const current_group of this.programs) {
        if (current_group.id === group_id) {
          if (
            current_group.hasOwnProperty('indicators') &&
            current_group.indicators.length !== 0
          ) {
            this._current_listing$.next(current_group.indicators);
            this._done_loading_list$.next(true);
          } else {
            load_new = true;
          }
        }
      }
      if (load_new) {
        this.programService.load(group_id).subscribe(
          indicators => {
            this._current_listing$.next(
              indicators.programs[0].programIndicators
            );
            this._done_loading_list$.next(true);
            for (const program of this.programs) {
              if (program.id === group_id) {
                program.indicators = indicators.programs[0].programIndicators;
              }
            }
          },
          error => {
            this._error_loading_list$.next({
              occurred: true,
              message: 'Something went wrong when trying to load Indicators'
            });
          }
        );
      }
    } else if (current_type === 'event') {
      let load_new = false;
      for (const event of this.events) {
        if (event.id === group_id) {
          if (event.indicators.length !== 0) {
            this._current_listing$.next(event.indicators);
            this._done_loading_list$.next(true);
          } else {
            load_new = true;
          }
        }
      }
      if (load_new) {
        this.eventService.load(group_id).subscribe(
          indicators => {
            const programDataElement = [];
            //noinspection TypeScriptUnresolvedVariable
            for (const event_data of indicators.programDataElements) {
              if (
                event_data.valueType === 'INTEGER_ZERO_OR_POSITIVE' ||
                event_data.valueType === 'BOOLEAN'
              ) {
                programDataElement.push(event_data);
              }
            }
            this._current_listing$.next(programDataElement);
            this._done_loading_list$.next(true);
            for (const event of this.events) {
              if (event.id === group_id) {
                event.indicators = this.current_listing;
              }
            }
          },
          error => {
            this._error_loading_list$.next({
              occurred: true,
              message: 'Something went wrong when trying to load Indicators'
            });
          }
        );
      }
    } else if (current_type === 'functions') {
      for (const functionItem of this.functions) {
        if (functionItem.id === group_id) {
          if (functionItem.rules.length !== 0) {
            this._current_listing$.next(functionItem.rules);
            this._done_loading_list$.next(true);
          } else {
            this._done_loading_list$.next(true);
            this._current_listing$.next([]);
          }
        }
      }
    } else {
    }
  }

  //  a function to check if bottleneck indicator exists
  botteneckIndicatorExist(item): boolean {
    let check = false;
    for (const indicator of this.highlighted_indicators_array) {
      if (indicator.id === item.id) {
        check = true;
      }
    }
    return check;
  }

  updateIndicatorDetails(item) {
    this.highlighted_indicators_array.forEach((value, index) => {
      if (value.id === item.id) {
        this.highlighted_indicators_array[index] = item;
      }
    });
    this.store.dispatch(
      new SetHighlightedIndicator([...this.highlighted_indicators_array])
    );
  }

  deleteIndicator(item) {
    this.highlighted_indicators_array.forEach((value, index) => {
      if (value.id === item.id) {
        this.highlighted_indicators_array.splice(index, 1);
      }
    });
    this.store.dispatch(
      new SetHighlightedIndicator([...this.highlighted_indicators_array])
    );
  }
  // load a single item for use in a score card
  load_item(item): void {
    if (this.botteneckIndicatorExist(item)) {
      this.deleteIndicator(item);
    } else {
      const indicator = {
        name: item.name,
        id: item.id,
        calculation: 'analytics',
        function_to_use: '',
        title: item.name,
        high_is_good: true,
        value: Math.floor(Math.random() * 60) + 40,
        weight: 100,
        legend_display: true,
        legendset: this.scorecardService.getIndicatorLegendSet(
          this.scorecard.data.legendset_definitions
        ),
        arrow_settings: {
          effective_gap: 5,
          display: true
        }
      };
      if (this.group_type === 'functions') {
        indicator.calculation = 'custom_function';
        indicator.function_to_use = this.activeGroup;
      }
      this.highlighted_indicators_array.push(indicator);
      this.store.dispatch(
        new SetHighlightedIndicator([...this.highlighted_indicators_array])
      );
    }
  }

  cancelSaving() {
    this.onCancelHighlightedEditor.emit();
  }

  trackItem(index, item) {
    return item && item.id ? item.id : index;
  }

  //  a function to remove bottleneck indicator
  removeIndicator(item) {
    this.highlighted_indicators_array.forEach((value, index) => {
      if (value.id === item.id) {
        this.highlighted_indicators_array.splice(index, 1);
      }
    });
  }

  initiateItems() {
    this.indicatorService.loadAll().subscribe(
      indicatorGroups => {
        for (const indicator_group of indicatorGroups.indicatorGroups) {
          this.indicatorGroups.push({
            id: indicator_group.id,
            name: indicator_group.name,
            indicators: indicator_group.indicators
          });
        }
        // this.current_groups = this.indicatorGroups;
        // this.error_loading_groups.occurred = false;
        // this.done_loading_groups = true;
        this._current_groups$.next(this.indicatorGroups);
        this._error_loading_groups$.next({ occurred: false, message: '' });
        this._done_loading_groups$.next(true);
        if (this.indicatorGroups.length !== 0) {
          this.load_list(this.indicatorGroups[0], 'indicators');
        }
      },
      error => {
        this._error_loading_groups$.next({
          occurred: true,
          message: 'There was an error when loading Indicator Groups'
        });
      }
    );
    // get dataElementsGroups
    this.dataElementService.loadAll().subscribe(
      dataElementGroups => {
        for (const date_element_group of dataElementGroups.dataElementGroups) {
          this.dataElementGroups.push({
            id: date_element_group.id,
            name: date_element_group.name,
            dataElements: []
          });
        }
      },
      error => {
        this._error_loading_groups$.next({
          occurred: true,
          message: 'There was an error when loading Indicator Groups'
        });
      }
    );
    // get Programs
    this.programService.loadAll().subscribe(
      programs => {
        for (const program_group of programs.programs) {
          this.programs.push({
            id: program_group.id,
            name: program_group.name,
            indicators: []
          });
          this.events.push({
            id: program_group.id,
            name: program_group.name,
            indicators: []
          });
        }
      },
      error => {
        this._error_loading_groups$.next({
          occurred: true,
          message: 'There was an error when loading Indicator Groups'
        });
      }
    );
    // get datasets
    this.datasetService.loadAll().subscribe(
      dataSets => {
        // noinspection TypeScriptUnresolvedVariable
        for (const dataset of dataSets.dataSets) {
          this.datasets.push({
            id: dataset.id,
            name: dataset.name,
            periodType: dataset.periodType
          });
        }
      },
      error => {
        this._error_loading_groups$.next({
          occurred: true,
          message: 'There was an error when loading Indicator Groups'
        });
      }
    );
    //  get functions
    this.store.select(getFunctions).subscribe(
      functions => {
        this.functions = functions;
      },
      error => {
        this._error_loading_groups$.next({
          occurred: true,
          message: 'There was an error when loading Indicator Groups'
        });
      }
    );
  }

  setOu(event) {
    this.store.dispatch(new SetHighlightedIndicatorOu(event.value));
  }
}
