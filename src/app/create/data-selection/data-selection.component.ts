import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ContextMenuComponent, ContextMenuService} from 'ngx-contextmenu';
import {Store} from '@ngrx/store';
import {ScoreCard} from '../../shared/models/scorecard';
import {IndicatorHolderGroup} from '../../shared/models/indicator-holders-group';
import {IndicatorHolder} from '../../shared/models/indicator-holder';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {ApplicationState} from '../../store/reducers';
import {FunctionService} from '../../shared/services/function.service';
import {DataService} from '../../shared/services/data.service';
import {EventDataService} from '../../shared/services/event-data.service';
import {ProgramIndicatorsService} from '../../shared/services/program-indicators.service';
import {DataElementGroupService} from '../../shared/services/data-element-group.service';
import {DatasetService} from '../../shared/services/dataset.service';
import {IndicatorGroupService} from '../../shared/services/indicator-group.service';
import {Observable} from 'rxjs/Observable';
import {getFunctions} from '../../store/selectors/static-data.selectors';
import {Legend} from '../../shared/models/legend';
import * as createActions from '../../store/actions/create.actions';

@Component({
  selector: 'app-data-selection',
  templateUrl: './data-selection.component.html',
  styleUrls: ['./data-selection.component.css']
})
export class DataSelectionComponent implements OnInit {

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
  @Output() onGroupTypeChange = new EventEmitter();
  @Output() onGroupActivate = new EventEmitter();
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

  p: number;
  r: number;

  dataset_types = [
    {id: '.REPORTING_RATE', name: 'Reporting Rate'},
    {id: '.REPORTING_RATE_ON_TIME', name: 'Reporting Rate on time'},
    {id: '.ACTUAL_REPORTS', name: 'Actual Reports Submitted'},
    {id: '.ACTUAL_REPORTS_ON_TIME', name: 'Reports Submitted on time'},
    {id: '.EXPECTED_REPORTS', name: 'Expected Reports'}
  ];

  @ViewChild(ContextMenuComponent)
  public contextMenu: ContextMenuComponent;
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
  load_item(item, pair = false): void {
    this.scorecardService.load_item(
      item,
      this.indicator_holders,
      this.indicator_holder_groups,
      this.current_indicator_holder,
      this.current_holder_group,
      this.legendset_definitions,
      this.additional_labels,
      this.group_type,
      this.activeGroup,
      pair,
      false,
      this.ordered_holder_list
    );
  }


  // context menu options
  public onContextMenu($event: MouseEvent, item: any): void {
    this.contextMenuService.show.next({
      // Optional - if unspecified, all context menu components will open
      contextMenu: this.contextMenu,
      event: $event,
      'item': item,
    });
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
    this.onGroupTypeChange.emit(current_type);

  }

  // load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_list(group_id, current_type): void {
    this.listQuery = null;
    this.activeGroup = group_id;
    this.onGroupActivate.emit(group_id);
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


  }


}
