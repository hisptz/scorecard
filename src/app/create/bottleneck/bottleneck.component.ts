import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EventDataService} from '../../shared/services/event-data.service';
import {ApplicationState} from '../../store/reducers';
import {Store} from '@ngrx/store';
import {ContextMenuService} from 'ngx-contextmenu';
import {DataElementGroupService} from '../../shared/services/data-element-group.service';
import {FunctionService} from '../../shared/services/function.service';
import {DatasetService} from '../../shared/services/dataset.service';
import {DataService} from '../../shared/services/data.service';
import {IndicatorGroupService} from '../../shared/services/indicator-group.service';
import {ProgramIndicatorsService} from '../../shared/services/program-indicators.service';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {getFunctions} from '../../store/selectors/static-data.selectors';
import {ScoreCard} from '../../shared/models/scorecard';
import {Observable} from 'rxjs/Observable';
import {Legend} from '../../shared/models/legend';
import {IndicatorHolderGroup} from '../../shared/models/indicator-holders-group';
import {IndicatorHolder} from '../../shared/models/indicator-holder';
import * as _ from 'lodash';
import {VisualizerService} from '../../shared/services/visualizer.service';
import {animate, group, query, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-bottleneck',
  templateUrl: './bottleneck.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./bottleneck.component.css'],
  animations: [
    trigger('groupFade', [
      state('void', style({opacity: 0.2})),
      transition(':enter', [
        style({opacity: 0.5, transform: 'scale(0.7)'}),
        group([
          animate('300ms 100ms ease-out', style({opacity: 1, transform: 'scale(1)'}))
        ])
      ]), transition(':leave', [
        style({opacity: 0.9, transform: 'scale(1)'}),
        group([
          animate('300ms 100ms ease-out', style({opacity: 0, transform: 'scale(0)'}))
        ])
      ])
    ]),
    trigger('fadeOut', [
      state('void', style({opacity: 0.6})),
      transition(':enter', animate('300ms ease-in'))
    ]),
    trigger('hiddenItem', [
      state('notHidden' , style({
        'transform': 'scale(1, 1)'
      })),
      state('hidden', style({
        'transform': 'scale(0.0, 0.00)',
        'visibility': 'hidden',
        'height': '0px'
      })),
      transition('notHidden <=> hidden', animate('300ms'))
    ])
  ]
})
export class BottleneckComponent implements OnInit {
  @Input() scorecard: ScoreCard;
  @Input() current_holder_group: IndicatorHolderGroup;
  @Input() current_indicator_holder: IndicatorHolder;
  @Input() indicator_holders: IndicatorHolder[];
  @Input() indicator_holder_groups: IndicatorHolderGroup[];
  @Input() need_for_indicator: boolean;
  @Input() need_for_group: boolean;
  @Input() ordered_holder_list: IndicatorHolder[];
  @Input() legendset_definitions: Legend[];
  @Input() additional_labels: any;
  @Input() indicator: any;
  @Input() current_bottleneck_group: any = null;

  @Output() onShowBottleneckEditor = new EventEmitter();
  @Output() onCancelBottleneckEditor = new EventEmitter();
  datasets: any[] = [];
  indicatorGroups: any[] = [];
  dataElementGroups: any[] = [];
  programs: any[] = [];
  events: any[] = [];
  functions: any =  [];
  current_groups: any[];
  current_listing: any[] = [];
  current_listing$: Observable<any[]>;
  activeGroup: string = null;
  listQuery: string = null;
  groupQuery: string = null;
  group_type: string = 'indicators';
  listReady: boolean = false;
  done_loading_groups: boolean = false;
  done_loading_list: boolean = false;
  error_loading_groups: any = {occurred: false, message: ''};
  error_loading_list: any = {occurred: false, message: ''};
  use_group_in_bottleneck: boolean = true;
  _current_groups$ = new BehaviorSubject([]);
  _current_listing$ = new BehaviorSubject([]);
  _done_loading_groups$ = new BehaviorSubject(false);
  _done_loading_list$ = new BehaviorSubject(false);
  _error_loading_groups$ = new BehaviorSubject({occurred: false, message: ''});
  _error_loading_list$ = new BehaviorSubject({occurred: false, message: ''});

  p: number;
  r: number;
  k: number;

  chartData: any = null;
  show_confirmation: boolean[] = [];

  enableGroupdragOperation = true;
  enableItemdragOperation = false;
  groupColors: string[] = ['#7DB2E8', '#80CC33', '#40BF80', '#75F0F0', '#9485E0', '#D98CCC', '#D98C99', '#D9998C', '#9485E0', '#E09485', '#F7B26E', '#E6C419', '#BFBF40', '#E09485', '#808080', '#B2B24D', '#525214'];
  dataset_types = [
    {id: '.REPORTING_RATE', name: 'Reporting Rate'},
    {id: '.REPORTING_RATE_ON_TIME', name: 'Reporting Rate on time'},
    {id: '.ACTUAL_REPORTS', name: 'Actual Reports Submitted'},
    {id: '.ACTUAL_REPORTS_ON_TIME', name: 'Reports Submitted on time'},
    {id: '.EXPECTED_REPORTS', name: 'Expected Reports'}
  ];
  constructor(
    private contextMenuService: ContextMenuService,
    private scorecardService: ScorecardService,
    private indicatorService: IndicatorGroupService,
    private datasetService: DatasetService,
    private dataElementService: DataElementGroupService,
    private programService: ProgramIndicatorsService,
    private eventService: EventDataService,
    private visulizationService: VisualizerService,
    private dataService: DataService,
    private functionService: FunctionService,
    private store: Store<ApplicationState>
  ) {
    this.initiateItems();
  }

  ngOnInit() {
    this.loadPriview();
    if (this.indicator.hasOwnProperty('bottleneck_indicators_groups')) {
      _.forEach(this.indicator.bottleneck_indicators_groups, (group, index) => {
        if (!group.hasOwnProperty('color')) {
          group.color = this.groupColors[index];
        }
      });
    }
  }

  activateGroupDrag() {
    this.enableItemdragOperation = false;
    this.enableGroupdragOperation = true;
  }

  deactivateGroupDrag() {
    this.enableItemdragOperation = true;
    this.enableGroupdragOperation = false;
  }

  loadPriview() {
    if (this.indicator.use_bottleneck_groups && this.indicator.bottleneck_indicators_groups.length !== 0) {
      this.prepareChart(this.indicator);
    }
    if (!this.indicator.use_bottleneck_groups && this.indicator.bottleneck_indicators.length !== 0) {
      this.prepareChart(this.indicator);
    }
  }

  initiateItems() {
    this.indicatorService.loadAll().subscribe(
      indicatorGroups => {
        for ( const group of indicatorGroups.indicatorGroups ) {
          this.indicatorGroups.push({
            id: group.id,
            name: group.name,
            indicators: group.indicators
          });
        }
        // this.current_groups = this.indicatorGroups;
        // this.error_loading_groups.occurred = false;
        // this.done_loading_groups = true;
        this._current_groups$.next(this.indicatorGroups);
        this._error_loading_groups$.next({occurred: false, message: ''});
        this._done_loading_groups$.next(true);
        if (this.indicatorGroups.length !== 0) {
          this.load_list(this.indicatorGroups[0], 'indicators');
        }
      },
      error => {
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Indicator Groups'});
      }
    );
    // get dataElementsGroups
    this.dataElementService.loadAll().subscribe(
      dataElementGroups => {
        for ( const group of dataElementGroups.dataElementGroups ) {
          this.dataElementGroups.push({
            id: group.id,
            name: group.name,
            dataElements: []
          });
        }
      },
      error => {
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Indicator Groups'});
      }
    );
    // get Programs
    this.programService.loadAll().subscribe(
      programs => {
        for ( const group of programs.programs ) {
          this.programs.push({
            id: group.id,
            name: group.name,
            indicators: []
          });
          this.events.push({
            id: group.id,
            name: group.name,
            indicators: []
          });
        }
      },
      error => {
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Indicator Groups'});
      }
    );
    // get datasets
    this.datasetService.loadAll().subscribe(
      dataSets => {
        // noinspection TypeScriptUnresolvedVariable
        for ( const dataset of dataSets.dataSets ) {
          this.datasets.push({
            id: dataset.id,
            name: dataset.name,
            periodType: dataset.periodType
          });
        }
      },
      error => {
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Indicator Groups'});
      }
    );
    //  get functions
    this.store.select(getFunctions).subscribe(
      functions => {
        this.functions = functions;
      },
      error => {
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Indicator Groups'});
      }
    );

  }

  // load a single item for use in a score card
  load_item(item, useGroup = false, group = null): void {
    if (useGroup) {
      if (group == null) {
        this.addGroup();
        this.load_item(item, useGroup, this.current_bottleneck_group);
      }else {
        if (this.botteneckIndicatorExist(item)) {
          // this.indicator.bottleneck_indicators_groups.forEach((singlegroup) => {
          //   if (this.indicatorInGroup(item, singlegroup)) {
          //     this.current_bottleneck_group = singlegroup;
          //   }
          // });
        }else {
          if (this.group_type === 'functions') {
            item.bottleneck_title = item.name;
            item.baseline = null;
            item.target = null;
            item.function = this.activeGroup;
          }else {
            item.bottleneck_title = item.name;
            item.baseline = null;
            item.target = null;
          }
          group.items.push(item);
          this.prepareChart(this.indicator);
        }
      }

    }else {
      if (this.botteneckIndicatorExist(item)) {
        this.removeBottleneckIndicator(item);
      }else {
        if (this.group_type === 'functions') {
          item.bottleneck_title = item.name;
          item.baseline = null;
          item.target = null;
          item.function = this.activeGroup;
        }else {
          item.bottleneck_title = item.name;
          item.baseline = null;
          item.target = null;
        }
        this.indicator.bottleneck_indicators.push(item);
      }
      this.prepareChart(this.indicator);
    }


  }

  clear(type) {
    if (type === 'items' && this.use_group_in_bottleneck) {
      this.indicator.bottleneck_indicators = [];
    }
    if (type === 'groups' && !this.use_group_in_bottleneck) {
      this.indicator.bottleneck_indicators = [];
    }


  }

  //  check if the indicator is already added in a scorecard
  indicatorExist(holders, indicator): boolean {
    return this.scorecardService.indicatorExist(holders, indicator);
  }

  // try to deduce last number needed to start adding indicator
  getStartingIndicatorId(): number {
    let last_id = 1;
    for (const holder of this.indicator_holders) {
      if ( holder.holder_id > last_id) {
        last_id = holder.holder_id;
      }
    }
    return last_id;
  }

  /**
   * Adding groups
   * @param current_type
   */
  addGroup() {
    const groupToBeAdded = {
      name: 'Determinant Name',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[0]
    };
    this.indicator.bottleneck_indicators_groups.push(groupToBeAdded);
    this.current_bottleneck_group = this.indicator.bottleneck_indicators_groups[this.indicator.bottleneck_indicators_groups.length - 1];
  }

  generateGroups() {
    const groupsToBeAdded = [{
      name: 'Commodities',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[0]
    }, {
      name: 'Human Resources',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[1]
    }, {
      name: 'Geographic Accessibility',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[2]
    }, {
      name: 'Initial Utilisation',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[3]
    }, {
      name: 'Continuous Utilisation',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[4]
    }, {
      name: 'Effective Coverage',
      id: this.scorecardService.makeid(),
      items: [],
      color: this.groupColors[5]
    }];
    this.indicator.bottleneck_indicators_groups = groupsToBeAdded;
    this.current_bottleneck_group = this.indicator.bottleneck_indicators_groups[0];
  }

  deleteGroup(group) {
    const index = _.findIndex(this.indicator.bottleneck_indicators_groups, {'id': group.id} );
    this.indicator.bottleneck_indicators_groups.splice(index, 1);
    this.prepareChart(this.indicator);
  }

  removeBottleneckIndicatorFromGroup( item, group) {
    const index = _.findIndex(group.items, {'id': item.id} );
    group.items.splice(index, 1);
    this.prepareChart(this.indicator);
  }

  // deal with all issues during group type switching between dataelent, indicators and datasets
  switchType(current_type): void {
    this.listReady = false;
    this.groupQuery = null;
    if (current_type === 'indicators') {
      this.setList(current_type, this.indicatorGroups);
    }else if (current_type === 'dataElements') {
      this.setList(current_type, this.dataElementGroups);
    }else if (current_type === 'datasets') {
      this.setList(current_type, this.dataset_types);
    }else if (current_type === 'programs') {
      this.setList(current_type, this.programs);
    }else if (current_type === 'event') {
      this.setList(current_type, this.programs);
    }else if (current_type === 'functions') {
      this.setList(current_type, this.functions);
    }else {

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
    if ( current_type === 'indicators' ) {
      let load_new = false;
      for ( const indicatorGroup  of this.indicatorGroups ) {
        if ( indicatorGroup.id === group_id ) {
          if (indicatorGroup.indicators.length !== 0) {
            this._current_listing$.next(indicatorGroup.indicators);
            this._done_loading_list$.next(true);
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.indicatorService.load(group_id).subscribe(
          indicators => {
            this._current_listing$.next(indicators.indicators);
            this._done_loading_list$.next(true);
            for ( const indicatorGroup  of this.indicatorGroups ) {
              if ( indicatorGroup.id === group_id ) {
                indicatorGroup.indicators = indicators.indicators;
              }
            }
          },
          error => {
            this._error_loading_list$.next({occurred: true, message: 'Something went wrong when trying to load Indicators'});
          }
        );
      }

    }else if ( current_type === 'dataElements' ) {
      let load_new = false;
      for ( const dataElementGroup  of this.dataElementGroups ) {
        if ( dataElementGroup.id === group_id ) {
          if (dataElementGroup.dataElements.length !== 0) {
            this._current_listing$.next(dataElementGroup.dataElements);
            this._done_loading_list$.next(true);
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.dataElementService.load(group_id).subscribe(
          dataElements => {
            this._current_listing$.next(dataElements.dataElements);
            this._done_loading_list$.next(true);
            for ( const dataElementGroup  of this.dataElementGroups ) {
              if ( dataElementGroup.id === group_id ) {
                dataElementGroup.dataElements = dataElements.dataElements;
              }
            }
          },
          error => {
            this._error_loading_list$.next({occurred: true, message: 'Something went wrong when trying to load Indicators'});
          }
        );
      }
    }else if ( current_type === 'datasets' ) {
      const current_listing = [];
      let group_name = '';
      for (const dataset_group of this.dataset_types ) {
        if (dataset_group.id === group_id) {
          group_name = dataset_group.name;
        }
      }
      for ( const dataset of this.datasets ) {
        current_listing.push(
          {id: dataset.id + group_id, name: group_name + ' ' + dataset.name}
        );
      }
      this._current_listing$.next(current_listing);
      this.listReady = true;
      this._done_loading_list$.next(true);
      this.listQuery = null;
    }else if ( current_type === 'programs' ) {
      let load_new = false;
      for ( const current_group  of this.programs ) {
        if ( current_group.id === group_id ) {
          if (current_group.hasOwnProperty('indicators') && current_group.indicators.length !== 0) {
            this._current_listing$.next(current_group.indicators);
            this._done_loading_list$.next(true);
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.programService.load(group_id).subscribe(
          indicators => {
            this._current_listing$.next(indicators.programs[0].programIndicators);
            this._done_loading_list$.next(true);
            for ( const program  of this.programs ) {
              if ( program.id === group_id ) {
                program.indicators = indicators.programs[0].programIndicators;
              }
            }
          },
          error => {
            this._error_loading_list$.next({occurred: true, message: 'Something went wrong when trying to load Indicators'});
          }
        );
      }

    }else if ( current_type === 'event' ) {
      let load_new = false;
      for ( const event  of this.events ) {
        if ( event.id === group_id ) {
          if (event.indicators.length !== 0) {
            this._current_listing$.next(event.indicators);
            this._done_loading_list$.next(true);
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.eventService.load(group_id).subscribe(
          indicators => {
            const programDataElement = [];
            //noinspection TypeScriptUnresolvedVariable
            for (const event_data of indicators.programDataElements ) {
              if (event_data.valueType === 'INTEGER_ZERO_OR_POSITIVE' || event_data.valueType === 'BOOLEAN' ) {
                programDataElement.push(event_data);
              }
            }
            this._current_listing$.next(programDataElement);
            this._done_loading_list$.next(true);
            for ( const event  of this.events ) {
              if ( event.id === group_id ) {
                event.indicators = this.current_listing;
              }
            }
          },
          error => {
            this._error_loading_list$.next({occurred: true, message: 'Something went wrong when trying to load Indicators'});
          }
        );
      }

    }else if ( current_type === 'functions' ) {
      for ( const functionItem  of this.functions ) {
        if ( functionItem.id === group_id ) {
          if (functionItem.rules.length !== 0) {
            this._current_listing$.next(functionItem.rules);
            this._done_loading_list$.next(true);
          }else {
            this._done_loading_list$.next(true);
            this._current_listing$.next([]);
          }
        }
      }
    }else {

    }
// if we need to add group as items
    if (this.use_group_in_bottleneck) {
      this.addGroupAsBottleneck(selectedGroup, this.current_listing, current_type);
    }
  }

  setActiveGroup(group) {
    if (this.current_bottleneck_group.id === group.id) {
      this.current_bottleneck_group = {};
    }else {
      this.current_bottleneck_group = group;
    }
    this.enableGroupdragOperation = true;
  }

  addGroupAsBottleneck(group, list, type) {
    // if (this.botteneckIndicatorExist(group)) {
    //   this.removeBottleneckIndicator(group);
    // }else {
    //   if (this.group_type === 'type') {
    //     group.bottleneck_title = group.name;
    //     group.type = 'group';
    //     group.baseline = null;
    //     group.target = null;
    //     group.items = list;
    //     group.function = this.activeGroup;
    //   } else {
    //     group.bottleneck_title = group.name;
    //     group.type = 'group';
    //     group.baseline = null;
    //     group.items = list;
    //     group.target = null;
    //   }
    //   this.indicator.bottleneck_indicators.push(group);
    // }
  }

  showBotleneckEditor(indicator) {
    const keys = [];
    this.indicator.bottleneck_indicators_groups.forEach((value, key) => {
      if (value.items.length !== 0) {
        keys.push(value);
      }
    });
    this.indicator.bottleneck_indicators_groups = keys;
    this.onShowBottleneckEditor.emit(indicator);
  }

  cancelSaving() {
    this.onCancelBottleneckEditor.emit();
  }

  //  a function to remove bottleneck indicator
  removeBottleneckIndicator(item) {
    this.indicator.bottleneck_indicators.forEach( (value, index) => {
      if ( value.id === item.id ) {
        this.indicator.bottleneck_indicators.splice(index, 1);
      }
    });
  }

  indicatorInGroup(item, group) {
    if (group) {
      const index = _.findIndex(group.items, {'id': item.id} );
      return index !== -1;
    }
    return false;
  }

  //  a function to check if bottleneck indicator exists
  botteneckIndicatorExist(item): boolean {
    let check  = false;
    if (!this.indicator.use_bottleneck_groups) {
      if (this.indicator.hasOwnProperty('bottleneck_indicators') ) {
        for ( const indicator of this.indicator.bottleneck_indicators ) {
          if ( indicator.id === item.id) {
            check = true;
          }
        }
      }
    }else {
      for ( const group of this.indicator.bottleneck_indicators_groups ) {
        if ( this.indicatorInGroup(item, group)) {
          check = true;
        }
      }
    }

    return check;
  }

  stopPropergation(event) {
    event.stopPropagation();
  }

  getEntities(itemArray, initialValues) {
    const entities = itemArray.reduce(
      (items: { [id: string]: any }, item: any) => {
        return {
          ...items,
          [item.id]: item,
        };
      },
      {
        ...initialValues,
      }
    );
    return entities;
  }

  prepareChart(item) {
    const indicatorsArray = [];
    const function_indicatorsArray = [];
    const labels = [];
    let names = {};
    let titles = {};
    const namesArr = [];
    const titlesArr = [];
    const colors = [];
    const chartColors = ['#7DB2E8', '#80CC33', '#40BF80', '#75F0F0', '#9485E0', '#D98CCC', '#D98C99', '#D9998C', '#9485E0', '#E09485', '#F7B26E', '#E6C419', '#BFBF40', '#E09485', '#80CC33', '#40BF80', '#75F0F0'];
    let colorCount = 0;
    const groupCateries = [];
    let useGroups = false;
    if (item.use_bottleneck_groups) {

      for (const bottleneck of item.bottleneck_indicators_groups) {
        groupCateries.push({
          name: bottleneck.name,
          categories: bottleneck.items.map((i) => i.bottleneck_title)
        });
        useGroups = true;
        if (bottleneck.hasOwnProperty('color')) {
          colors.push(...bottleneck.items.map((i) => bottleneck.color));
        }else {
          colors.push(...bottleneck.items.map((i) => chartColors[colorCount]));
        }

        colorCount = colorCount + 1;
        if (bottleneck.hasOwnProperty('function')) {
          function_indicatorsArray.push(...bottleneck.items);
        }else {
          indicatorsArray.push(...bottleneck.items.map((i) => i.id));
        }
        labels.push(...bottleneck.items.map((i) => { return {'id': i.id, 'name': i.bottleneck_title}; }));
        namesArr.push(...bottleneck.items.map((i) => { return {'id': i.bottleneck_title + ':' + bottleneck.name, 'name': i.name}; }));
        titlesArr.push(...bottleneck.items.map((i) => { return {'id': i.bottleneck_title, 'name': i.name}; }));
        names = this.getEntities(namesArr, names);
        titles = this.getEntities(titlesArr, titles);
      }
    }else {
      for (const bottleneck of item.bottleneck_indicators) {
        if (bottleneck.hasOwnProperty('function')) {
          function_indicatorsArray.push(bottleneck);
          labels.push({'id': bottleneck.id, 'name': bottleneck.bottleneck_title});
        }else {
          indicatorsArray.push(bottleneck.id);
          labels.push({'id': bottleneck.id, 'name': bottleneck.bottleneck_title});
        }
        namesArr.push({'id': bottleneck.bottleneck_title, 'name': bottleneck.name});
        names = this.getEntities(namesArr, names);
      }
    }
    const visualizer_config: any = {
      'type': 'chart',
      'tableConfiguration': {},
      'chartConfiguration': {
        'type': 'column',
        'show_labels': false,
        'title': 'Sample bottleneck Chart',
        'xAxisType': 'dx',
        'yAxisType': 'ou',
        'labels': labels,
        'rotation': 0,
        'dataGroups': groupCateries.length === 0 ? null : groupCateries,
      }
    };
    if (groupCateries.length !== 0) {
      visualizer_config.chartConfiguration.tooltipItems = names;
      visualizer_config.chartConfiguration.titlesItems = titles;
      visualizer_config.chartConfiguration.colors = colors;
    }
    if (labels.length === 0) {
      this.chartData = null;
    }else {
      this.chartData = this.visulizationService.drawChart(this.getSampleAnalytics(labels), visualizer_config.chartConfiguration);
    }

  }

  onDropSuccess(e) {
    this.prepareChart(this.indicator);
  }

  getSampleAnalytics(labels) {
    const combined_analytics: any = {
      headers: [
        {
        'name': 'dx',
        'column': 'Data',
        'valueType': 'TEXT',
        'type': 'java.lang.String',
        'hidden': false,
        'meta': true
      },
        {
          'name': 'ou',
          'column': 'Organisation unit',
          'valueType': 'TEXT',
          'type': 'java.lang.String',
          'hidden': false,
          'meta': true
        },
        {
          'name': 'pe',
          'column': 'Period',
          'valueType': 'TEXT',
          'type': 'java.lang.String',
          'hidden': false,
          'meta': true
        },
        {
          'name': 'value',
          'column': 'Value',
          'valueType': 'NUMBER',
          'type': 'java.lang.Double',
          'hidden': false,
          'meta': false
        }],
      metaData: {
        names: {},
        dx: [],
        pe: [],
        ou: [],
        co: []
      },
      rows: [],
      width: 0,
      height: 0
    };

    for (const lab of labels) {
      combined_analytics.metaData.names[lab.id] = lab.name;
    }
    combined_analytics.metaData.names['ouid'] = 'Organisation Unit';
    combined_analytics.metaData.names['peid'] = 'Selected Period';
    combined_analytics.metaData.ou = ['ouid'];
    combined_analytics.metaData.pe = ['peid'];
    combined_analytics.metaData.dx = labels.map(label => label.id);
    combined_analytics.rows = labels.map((label) =>  {
      return [ label.id,   'ouid', 'peid',  Math.floor((Math.random() * 80) + 20) + '' ];
    });
    return combined_analytics;

  }

  trackItem(index, item) {
    return item ? item.id : undefined;
  }

}
