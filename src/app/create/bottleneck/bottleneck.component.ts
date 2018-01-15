import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

@Component({
  selector: 'app-bottleneck',
  templateUrl: './bottleneck.component.html',
  styleUrls: ['./bottleneck.component.css']
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
  p: number;
  r: number;

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
    private dataService: DataService,
    private functionService: FunctionService,
    private store: Store<ApplicationState>
  ) {
    this.initiateItems();
  }

  ngOnInit() {
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
        this.current_groups = this.indicatorGroups;
        this.error_loading_groups.occurred = false;
        this.done_loading_groups = true;
        this.load_list(this.current_groups[0].id, 'indicators');
      },
      error => {
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Indicator Groups';
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
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Data Element Groups';
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
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Programs';
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
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Data sets';
      }
    );
    //  get functions
    this.store.select(getFunctions).subscribe(
      functions => {
        this.functions = functions;
      },
      error => {
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Data sets';
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
        if (this.indicatorInGroup(item, group)) {
          this.removeBottleneckIndicatorFromGroup(item, group);
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
      items: []
    };
    this.indicator.bottleneck_indicators_groups.push(groupToBeAdded);
    this.current_bottleneck_group = this.indicator.bottleneck_indicators_groups[this.indicator.bottleneck_indicators_groups.length -1];
  }

  removeBottleneckIndicatorFromGroup( item, group) {
    const index = _.findIndex(group.items, {'id': item.id} );
    group.items.splice(index, 1);
  }

  // deal with all issues during group type switching between dataelent, indicators and datasets
  switchType(current_type): void {
    this.listReady = false;
    this.groupQuery = null;
    if (current_type === 'indicators') {
      this.current_groups = this.indicatorGroups;
      if (this.current_groups.length !== 0) {
        this.load_list(this.current_groups[0].id, current_type);
      }
    }else if (current_type === 'dataElements') {
      this.current_groups = this.dataElementGroups;
      if (this.current_groups.length !== 0) {
        this.load_list(this.current_groups[0].id, current_type);
      }
    }else if (current_type === 'datasets') {
      this.current_groups = this.dataset_types;
      if (this.current_groups.length !== 0) {
        this.load_list(this.current_groups[0].id, current_type);
      }
    }else if (current_type === 'programs') {
      this.current_groups = this.programs;
      if (this.current_groups.length !== 0) {
        this.load_list(this.current_groups[0].id, current_type);
      }
    }else if (current_type === 'event') {
      this.current_groups = this.programs;
      if (this.current_groups.length !== 0) {
        this.load_list(this.current_groups[0].id, current_type);
      }
    }else if (current_type === 'functions') {
      this.current_groups = this.functions;
      if (this.current_groups.length !== 0) {
        this.load_list(this.current_groups[0].id, current_type);
      }
    }else {

    }

  }

  // load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_list(selectedGroup, current_type): void {
    const group_id = selectedGroup.id;
    this.listQuery = null;
    this.activeGroup = group_id;
    this.listReady = true;
    this.current_listing = [];
    this.done_loading_list = true;
    if ( current_type === 'indicators' ) {
      let load_new = false;
      for ( const group  of this.indicatorGroups ) {
        if ( group.id === group_id ) {
          if (group.indicators.length !== 0) {
            this.current_listing = group.indicators;
            this.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.indicatorService.load(group_id).subscribe(
          indicators => {
            this.current_listing = indicators.indicators;
            this.done_loading_list = true;
            for ( const group  of this.indicatorGroups ) {
              if ( group.id === group_id ) {
                group.indicators = indicators.indicators;
              }
            }
          },
          error => {
            this.error_loading_list.occurred = true;
            this.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }

    }else if ( current_type === 'dataElements' ) {
      let load_new = false;
      for ( const group  of this.dataElementGroups ) {
        if ( group.id === group_id ) {
          if (group.dataElements.length !== 0) {
            this.current_listing = group.dataElements;
            this.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.dataElementService.load(group_id).subscribe(
          dataElements => {
            this.current_listing = dataElements.dataElements;
            this.done_loading_list = true;
            for ( const group  of this.dataElementGroups ) {
              if ( group.id === group_id ) {
                group.dataElements = dataElements.dataElements;
              }
            }
          },
          error => {
            this.error_loading_list.occurred = true;
            this.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }
    }else if ( current_type === 'datasets' ) {
      this.current_listing = [];
      let group_name = '';
      for (const dataset_group of this.dataset_types ) {
        if (dataset_group.id === group_id) {
          group_name = dataset_group.name;
        }
      }
      for ( const dataset of this.datasets ) {
        this.current_listing.push(
          {id: dataset.id + group_id, name: group_name + ' ' + dataset.name}
        );
      }
      this.listReady = true;
      this.done_loading_list = true;
      this.listQuery = null;
    }else if ( current_type === 'programs' ) {
      let load_new = false;
      for ( const group  of this.programs ) {
        if ( group.id === group_id ) {
          if (group.indicators.length !== 0) {
            this.current_listing = group.indicators;
            this.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.programService.load(group_id).subscribe(
          indicators => {
            this.current_listing = indicators.programs[0].programIndicators;
            this.done_loading_list = true;
            for ( const group  of this.programs ) {
              if ( group.id === group_id ) {
                group.indicators = indicators.programs.programIndicators;
              }
            }
          },
          error => {
            this.error_loading_list.occurred = true;
            this.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }

    }else if ( current_type === 'event' ) {
      let load_new = false;
      for ( const group  of this.events ) {
        if ( group.id === group_id ) {
          if (group.indicators.length !== 0) {
            this.current_listing = group.indicators;
            this.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.eventService.load(group_id).subscribe(
          indicators => {
            //noinspection TypeScriptUnresolvedVariable
            for (const event_data of indicators.programDataElements ) {
              if (event_data.valueType === 'INTEGER_ZERO_OR_POSITIVE' || event_data.valueType === 'BOOLEAN' ) {
                this.current_listing.push(event_data);
              }
            }
            this.done_loading_list = true;
            for ( const group  of this.events ) {
              if ( group.id === group_id ) {
                group.indicators = this.current_listing;
              }
            }
          },
          error => {
            this.error_loading_list.occurred = true;
            this.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }

    }else if ( current_type === 'functions' ) {
      for ( const group  of this.functions ) {
        if ( group.id === group_id ) {
          if (group.rules.length !== 0) {
            this.current_listing = group.rules;
            this.done_loading_list = true;
          }else {
            this.done_loading_list = true;
            this.current_listing = [];
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
    this.current_bottleneck_group = group;
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
    this.onShowBottleneckEditor.emit(indicator);
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
    if (this.indicator.hasOwnProperty('bottleneck_indicators') ) {
      for ( const indicator of this.indicator.bottleneck_indicators ) {
        if ( indicator.id === item.id) {
          check = true;
        }
      }
    }
    return check;
  }

  stopPropergation(event) {
    event.stopPropagation();
  }


}
