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
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {animate, group, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-data-selection',
  templateUrl: './data-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./data-selection.component.css'],
  animations: [
    trigger('fadeOut', [
      state('void', style({opacity: 0.6})),
      transition(':enter', animate('300ms ease-in'))
    ])
  ]
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
  current_groups: any[] = [];
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

  _current_groups$ = new BehaviorSubject([]);
  _current_listing$ = new BehaviorSubject([]);
  _done_loading_groups$ = new BehaviorSubject(false);
  _done_loading_list$ = new BehaviorSubject(false);
  _error_loading_groups$ = new BehaviorSubject({occurred: false, message: ''});
  _error_loading_list$ = new BehaviorSubject({occurred: false, message: ''});

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
        // this.current_groups = this.indicatorGroups;
        // this.error_loading_groups.occurred = false;
        // this.done_loading_groups = true;
        this._current_groups$.next(this.indicatorGroups);
        this._error_loading_groups$.next({occurred: false, message: ''});
        this._done_loading_groups$.next(true);
        if (this.indicatorGroups.length !== 0) {
          this.load_list(this.indicatorGroups[0].id, 'indicators');
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
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Data Elements'});
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
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Programs'});
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
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Data sets'});
      }
    );
    //  get functions
    this.store.select(getFunctions).subscribe(
      functions => {
        this.functions = functions;
      },
      error => {
        this._error_loading_groups$.next({occurred: true, message: 'There was an error when loading Data sets'});
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
    this.onGroupTypeChange.emit(current_type);
  }

  setList(type, groups) {
    this._current_groups$.next(groups);
    if (groups.length !== 0) {
      this.load_list(groups[0].id, type);
    }
  }

  // load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_list(group_id, current_type): void {
    this.listQuery = null;
    this.activeGroup = group_id;
    this.onGroupActivate.emit(group_id);
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
  }

  trackItem(index, item) {
    return item ? item.id : undefined;
  }

}
