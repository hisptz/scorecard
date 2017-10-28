import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import { Location } from '@angular/common';

import {ScoreCard} from '../shared/models/scorecard';
import {Dataset, DatasetService} from '../shared/services/dataset.service';
import {IndicatorGroup} from '../shared/models/indicator-group';
import {DataElementGroup, DataElementGroupService} from '../shared/services/data-element-group.service';
import {ProgramIndicatorGroups, ProgramIndicatorsService} from '../shared/services/program-indicators.service';
import {EventData, EventDataService} from '../shared/services/event-data.service';
import {TreeComponent} from 'angular-tree-component';
import {IndicatorGroupService} from '../shared/services/indicator-group.service';
import {ScorecardService} from '../shared/services/scorecard.service';
import {OrgUnitService} from '../shared/services/org-unit.service';
import {FunctionService} from '../shared/services/function.service';
import {DataService} from '../shared/services/data.service';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../store/application.state';
import * as selectors from '../store/selectors';
import {UpdateScorecardAction} from '../store/actions/store.data.action';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('notHovered' , style({
        'transform': 'scale(1, 1)',
        '-webkit-box-shadow': '0 0 0px rgba(0,0,0,0.1)',
        'box-shadow': '0 0 0px rgba(0,0,0,0.2)',
        'background-color': 'rgba(0,0,0,0.0)',
        'border': '0px solid #ddd'
      })),
      state('hoovered', style({
        'transform': 'scale(1.04, 1.04)',
        '-webkit-box-shadow': '0 0 10px rgba(0,0,0,0.2)',
        'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
        'background-color': 'rgba(0,0,0,0.03)',
        'border': '1px solid #ddd'
      })),
      transition('notHovered <=> hoovered', animate('400ms'))
    ])
  ]
})
export class CreateComponent implements OnInit, AfterViewInit, OnDestroy {

  // variable initializations
  datasets: Dataset[];
  indicatorGroups: IndicatorGroup[];
  dataElementGroups: DataElementGroup[];
  programs: ProgramIndicatorGroups[];
  events: EventData[];
  functions: any =  [];
  current_groups: any[];
  current_listing: any[];
  activeGroup: string = null;
  done_loading_groups: boolean = false;
  done_loading_list: boolean = false;
  error_loading_groups: any = {occurred: false, message: ''};
  error_loading_list: any = {occurred: false, message: ''};
  scorecard: ScoreCard;
  listReady: boolean = false;
  listQuery: string = null;
  groupQuery: string = null;
  need_for_group: boolean = false;
  need_for_indicator: boolean = false;
  current_group_id: number = 1;
  current_holder_group_id: number = 1;
  current_indicator_holder: any;
  current_holder_group: any;
  saving_scorecard: boolean = false;
  saving_error: boolean = false;
  deleting: boolean[] = [];
  someErrorOccured: boolean = false;
  show_delete_legend: boolean[] = [];
  show_add_legend: boolean = false;

  p: number;
  k: number;
  r: number;

  orgunit_model: any =  {
    selection_mode: 'Usr_orgUnit',
    selected_levels: [],
    show_update_button: true,
    selected_groups: [],
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    type: 'report', // can be 'data_entry'
    selected_user_orgunit: []
  };

  @ViewChild('title')
  title_element: ElementRef;

  @ViewChild('description')
  discription_element: ElementRef;

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('pertree')
  pertree: TreeComponent;
  selected_periods: any = [];
  period_type: string = 'Quarterly';
  dataset_types = [
    {id: '', name: 'Reporting Rate'},
    {id: '.REPORTING_RATE_ON_TIME', name: 'Reporting Rate on time'},
    {id: '.ACTUAL_REPORTS', name: 'Actual Reports Submitted'},
    {id: '.ACTUAL_REPORTS_ON_TIME', name: 'Reports Submitted on time'},
    {id: '.EXPECTED_REPORTS', name: 'Expected Reports'}
  ];
  show_editor: boolean = false;
  editor;

  newLabel: string = '';

  private subscription: Subscription;

  show_bottleneck_indicators: boolean = false;
  bottleneck_card: any = {};

  new_color: string = '#fff';
  new_definition: string = '';

  current_action: string = 'new';
  have_authorities: boolean = false;

  user: any = {};
  userGroups: any = [];
  group_loading = true;
  selected_groups: any = [];
  group_type: string = 'indicators';
  bootleneck_group_type: string = 'indicators';
  percent_complete: number = 0;
  constructor(private indicatorService: IndicatorGroupService,
              private datasetService: DatasetService,
              private dataElementService: DataElementGroupService,
              private router: Router,
              private scorecardService: ScorecardService,
              private activatedRouter: ActivatedRoute,
              private programService: ProgramIndicatorsService,
              private eventService: EventDataService,
              private dataService: DataService,
              private functionService: FunctionService,
              private _location: Location,
              private store: Store<ApplicationState>
  ) {
    this.indicatorGroups = [];
    this.dataElementGroups = [];
    this.programs = [];
    this.events = [];
    this.datasets = [];
    this.current_groups = [];
    this.current_listing = [];
    // initialize the scorecard with a uid
    this.scorecard = this.scorecardService.getEmptyScoreCard();
    this.dataService.getUserInformation().subscribe(
      userInfo => {
        //noinspection TypeScriptUnresolvedVariable
        this.user.name = userInfo.name;
        this.user.id = userInfo.id;
        userInfo.userCredentials.userRoles.forEach( (role) => {
          role.authorities.forEach( (ath) => {
            if ( ath === 'ALL') {
              this.have_authorities = true;
            }
          });

        });
      }
    );

    // this.getItemsFromGroups();
    this.current_indicator_holder = {
      'holder_id': this.getStartingIndicatorId(),
      'indicators': []
    };
    this.current_holder_group = {
      'id': this.getStartingGroupHolderId(),
      'name': 'Default',
      'indicator_holder_ids': [],
      'background_color': '#ffffff',
      'holder_style': null
    };
  }

  isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  ngOnInit() {
    this.dataService.getUserGroupInformation().subscribe( userGroups => {
      this.group_loading = false;
      this.userGroups.push({
        id: 'all',
        name: 'Public',
        title: 'This will be accessible to everyone in the system accessing the scorecard'
      });
      this.userGroups = [...this.userGroups, ...userGroups.userGroups];
    });
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        const id = params['scorecardid'];
        const type = params['type'];
        if (type === 'new') {
          this.period_type = this.scorecard.data.periodType;
          this.current_action = 'new';
          this.scorecard.data.user = this.user;
          this.percent_complete = 10;
        }else {
          this.current_action = 'update';
          this.need_for_group = true;
          this.need_for_indicator = true;
          this.store.select(selectors.getSelectedScorecard).subscribe(
            (scorecard_details: any) => {
              if (scorecard_details == null) {
                this.scorecardService.load(id).subscribe(
                  (scorecardItem) => {
                    this.setUpScoreCard(scorecardItem, id);
                  }
                );
              }else {
                this.setUpScoreCard(scorecard_details.data, id);
              }
            });

        }
      }
    );
    // get indicatorGroups
    this.indicatorService.loadAll().subscribe(
      indicatorGroups => {
        this.percent_complete += 20;
        for ( const group of indicatorGroups.indicatorGroups ) {
          this.indicatorGroups.push({
            id: group.id,
            name: group.name,
            indicators: []
          });
        }
        this.current_groups = this.indicatorGroups;
        this.bottleneck_card.current_groups = this.indicatorGroups;
        this.bottleneck_card.indicator = {};
        this.bottleneck_card.indicator_ready = false;
        this.error_loading_groups.occurred = false;
        this.done_loading_groups = true;
        this.bottleneck_card.done_loading_groups = true;
        this.load_list(this.current_groups[0].id, 'indicators');
        this.load_bottleneck_card_list(this.bottleneck_card.current_groups[0].id, 'indicators');
      },
      error => {
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Indicator Groups';
      }
    );
    // get dataElementsGroups
    this.dataElementService.loadAll().subscribe(
      dataElementGroups => {
        this.percent_complete += 20;
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
        this.percent_complete += 20;
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
        this.percent_complete += 10;
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
    this.functionService.getAll().subscribe(
      functions => {
        this.percent_complete += 20;
        // noinspection TypeScriptUnresolvedVariable
        this.functions = functions;
      },
      error => {
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = 'There was an error when loading Data sets';
      }
    );
    // period configuration
    // this.periods = this.filterService.getPeriodArray( this.period_type, this.year );
  }

  setUpScoreCard(scorecard_details, id) {
    this.percent_complete = 10;
    this.scorecard = {
      id: id,
      name: scorecard_details.header.title,
      data: scorecard_details
    };
    // check if period configuration is there
    if (!this.scorecard.data.hasOwnProperty('periodType')) {
      this.scorecard.data.periodType = 'Quarterly';
    }
    if (!this.scorecard.data.hasOwnProperty('selected_periods')) {
      this.scorecard.data.selected_periods = [];
    }
    if (!this.scorecard.data.hasOwnProperty('user')) {
      this.scorecard.data.user = this.user;
    }
    if (!this.scorecard.data.hasOwnProperty('user_groups')) {
      this.scorecard.data.user_groups = [];
    }
    // replace selected user orgunit with correct configuration

    // attach organisation unit if none is defined
    if (!this.scorecard.data.orgunit_settings.hasOwnProperty('selected_orgunits')) {
      this.scorecard.data.orgunit_settings = {
        'selection_mode': 'Usr_orgUnit',
        'selected_levels': [],
        'show_update_button': true,
        'selected_groups': [],
        'orgunit_levels': [],
        'orgunit_groups': [],
        'selected_orgunits': [],
        'user_orgunits': [],
        'type': 'report',
        'selected_user_orgunit': []
      };
    }else if (!this.isArray(this.scorecard.data.orgunit_settings.selected_levels)) {
      this.scorecard.data.orgunit_settings = {
        'selection_mode': 'Usr_orgUnit',
        'selected_levels': [],
        'show_update_button': true,
        'selected_groups': [],
        'orgunit_levels': [],
        'orgunit_groups': [],
        'selected_orgunits': [],
        'user_orgunits': [],
        'type': 'report',
        'selected_user_orgunit': []
      };
    }
    // attach period type if none is defined
    if (!this.scorecard.data.hasOwnProperty('periodType')) {
      this.scorecard.data.periodType = 'Quarterly';
    }
    this.period_type = this.scorecard.data.periodType;
    // attach average_selection if none is defined
    if (!this.scorecard.data.hasOwnProperty('average_selection')) {
      this.scorecard.data.average_selection = 'all';
    }
    // attach shown_records if none is defined
    if (!this.scorecard.data.hasOwnProperty('shown_records')) {
      this.scorecard.data.shown_records = 'all';
    }
    // attach show_average_in_row if none is defined
    if (!this.scorecard.data.hasOwnProperty('show_average_in_row')) {
      this.scorecard.data.show_average_in_row = false;
    }
    // attach show_average_in_column if none is defined
    if (!this.scorecard.data.hasOwnProperty('show_average_in_column')) {
      this.scorecard.data.show_average_in_column = false;
    }
    // attach a property empty row if none is defined
    if (!this.scorecard.data.hasOwnProperty('empty_rows')) {
      this.scorecard.data.empty_rows = true;
    }
    // this.getItemsFromGroups();
    let i = 0;
    for ( const item of this.scorecard.data.data_settings.indicator_holder_groups ) {
      i++;
      if (i === 1) {
        this.current_holder_group = item;
      }else { continue; }

    }
    let j = 0;
    for ( const item of this.scorecard.data.data_settings.indicator_holders) {
      for ( const indicator of item.indicators ) {
        if (!indicator.hasOwnProperty('bottleneck_indicators')) {
          indicator.bottleneck_indicators = [];
        }
      }
      j++;
      if (j === 1) {
        this.current_indicator_holder = item;
      }else { continue; }
    }

  }


  optionUpdated(options: any) {
    this.scorecard.data.header.show_legend_definition = options.show_legend_definition;
    this.scorecard.data.show_rank = options.show_rank;
    this.scorecard.data.empty_rows = options.empty_rows;
    this.scorecard.data.show_average_in_column = options.show_average_in_column;
    this.scorecard.data.show_average_in_row = options.show_average_in_row;
    this.scorecard.data.average_selection = options.average_selection;
    this.scorecard.data.shown_records = options.shown_records;
    this.scorecard.data.show_score = options.show_score;
    this.scorecard.data.header.show_arrows_definition = options.show_arrows_definition;
    this.scorecard.data.show_data_in_column = options.show_data_in_column;
  }

  updateOrgUnitModel(ouModel) {
    this.scorecard.data.orgunit_settings = ouModel;
  }

  updatePeriod (period) {
    this.scorecard.data.selected_periods = period.items;
    this.scorecard.data.periodType = period.type;
  }

  ngAfterViewInit() {
    this.title_element.nativeElement.focus();
    // tinymce.init({
    //   selector: '#my-editor-id',
    //   height: 200,
    //   plugins: ['link', 'paste', 'table', 'image', 'code'],
    //   skin_url: 'assets/skins/lightgray',
    //   setup: editor => {
    //     this.editor = editor;
    //     editor.on('keyup', () => {
    //       // const content = editor.getContent();
    //       // this.keyupHandlerFunction(content);
    //     });
    //     editor.on('change', () => {
    //       const content = editor.getContent();
    //       this.scorecard.data.header.template.content = content;
    //     });
    //   },
    //
    // });
    if ( this.current_action === 'new' ) {
      // this.activateNode(this.filterService.getPeriodArray( this.period_type, this.year )[0].id, this.pertree);
    }


  }

  onTitleChange(event) {
    console.log('changed', event);
  }

  onTitleReady(event) {
    console.log('ready', event);
  }

  onTitleBlur(event) {
    console.log('blur', event);
  }
  // cancel scorecard creation process
  cancelCreate() {
    this._location.back();
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
  load_list(group_id, current_type): void {
    this.listQuery = null;
    this.activeGroup = group_id;
    this.listReady = true;
    this.current_listing = [];
    this.done_loading_list = false;
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

  // load a single item for use in a score card
  load_item(item): void {

    if ( this.indicatorExist( this.scorecard.data.data_settings.indicator_holders, item )) {
      this.deleteIndicator(item);
    }else {
      const indicator = this.scorecardService.getIndicatorStructure(item.name, item.id, this.getIndicatorLegendSet());
      if (this.group_type === 'functions') {
        indicator.calculation = 'custom_function';
        indicator.function_to_use = this.activeGroup;
      }
      indicator.value = Math.floor(Math.random() * 60) + 40;
      const random = Math.floor(Math.random() * 6) + 1;
      if ( random % 2 === 0) { indicator.showTopArrow = true; }else { indicator.showBottomArrow = true; }
      // ensure indicator has all additinal labels
      for (const label of this.scorecard.data.additional_labels ) {
        indicator.additional_label_values[label] = '';
      }
      // this.current_indicator_holder.holder_id = this.current_group_id;
      if (this.current_indicator_holder.indicators.length < 2) {
        this.current_indicator_holder.indicators.push( indicator );
      }else {
        this.current_group_id = this.getStartingIndicatorId() + 1;
        this.current_indicator_holder = {
          'holder_id': this.current_group_id,
          'indicators': []
        };
        this.current_indicator_holder.indicators.push( indicator );
        this.need_for_indicator = false;
        this.cleanUpEmptyColumns();
      }
      this.addIndicatorHolder(this.current_indicator_holder);
      this.current_holder_group.id = this.current_holder_group_id;
      this.addHolderGroups(this.current_holder_group, this.current_indicator_holder);
      console.log(indicator);
    }


  }

  // load a single item for use in a score card
  load_itemFromDragNDrop(item): void {

    if ( this.indicatorExist( this.scorecard.data.data_settings.indicator_holders, item )) {
      // this.deleteIndicator(item);
    }else {
      const indicator = this.scorecardService.getIndicatorStructure(item.name, item.id, this.getIndicatorLegendSet());
      indicator.value = Math.floor(Math.random() * 60) + 40;
      const random = Math.floor(Math.random() * 6) + 1;
      if ( random % 2 === 0) { indicator.showTopArrow = true; }else { indicator.showBottomArrow = true; }
      // ensure indicator has all additinal labels
      for (const label of this.scorecard.data.additional_labels ) {
        indicator.additional_label_values[label] = '';
      }
      // this.current_indicator_holder.holder_id = this.current_group_id;
      if (this.current_indicator_holder.indicators.length < 2) {
        this.current_indicator_holder.indicators.push( indicator );
      }else {
        this.current_group_id = this.getStartingIndicatorId() + 1;
        this.current_indicator_holder = {
          'holder_id': this.current_group_id,
          'indicators': []
        };
        this.current_indicator_holder.indicators.push( indicator );
        this.need_for_indicator = false;
        this.cleanUpEmptyColumns();
      }
      this.addIndicatorHolder(this.current_indicator_holder);
      this.current_holder_group.id = this.current_holder_group_id;
      this.addHolderGroups(this.current_holder_group, this.current_indicator_holder);
    }

  }

  // add an indicator holder to a scorecard
  addIndicatorHolder(indicator_holder): void {
    let add_new = true;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ) {
      if (holder.holder_id === indicator_holder.holder_id) {
        holder = indicator_holder;
        add_new = false;
      }
    }
    if (add_new) {
      this.scorecard.data.data_settings.indicator_holders.push(indicator_holder);
    }
    this.need_for_indicator = true;
  }

  // add a group of holders to a scorecard
  addHolderGroups( holder_group, holder, current_id: any = null ): void {
    this.need_for_group = true;
    let add_new = true;
    for ( const group of this.scorecard.data.data_settings.indicator_holder_groups ) {
      if (group.id === holder_group.id) {
        if ( group.indicator_holder_ids.indexOf(holder.holder_id) === -1 ) {
          const index = this.findSelectedIndicatorIndex( current_id, group );
          group.indicator_holder_ids.splice(index, 0, holder.holder_id);
          // group.indicator_holder_ids.push(holder.holder_id);
        }
        add_new = false;
      }
    }
    if (add_new) {
      this.deleting[holder_group.id] = false;
      if ( holder_group.indicator_holder_ids.indexOf(holder.holder_id) === -1 ) {holder_group.indicator_holder_ids.push(holder.holder_id); }
      this.scorecard.data.data_settings.indicator_holder_groups.push(holder_group);
    }
  }

  // add a group of holders to a scorecard
  addHolderGroupsFromDragNDrop( holder_group, holder, current_id: any = null ): void {
    this.need_for_group = true;
    let add_new = true;
    for ( const group of this.scorecard.data.data_settings.indicator_holder_groups ) {
      if (group.id === holder_group.id) {
        if ( group.indicator_holder_ids.indexOf(holder.holder_id) === -1 ) {
          const index = this.findSelectedIndicatorIndex( current_id, group ) - 1;
          group.indicator_holder_ids.splice(index, 0, holder.holder_id);
          // group.indicator_holder_ids.push(holder.holder_id);
        }
        add_new = false;
      }
    }
    if (add_new) {
      this.deleting[holder_group.id] = false;
      if ( holder_group.indicator_holder_ids.indexOf(holder.holder_id) === -1 ) { holder_group.indicator_holder_ids.push(holder.holder_id); }
      this.scorecard.data.data_settings.indicator_holder_groups.push(holder_group);
    }
  }

  // find the position of the selected Indicator
  findSelectedIndicatorIndex(current_id, group) {
    let i = 0; let index = group.indicator_holder_ids.length;
    for ( const item of group.indicator_holder_ids ) {
      i++;
      if ( item === current_id ) {
        index = i;
      }
    }
    return index;
  }

  // enabling creating of group
  createGroup(): void {
    this.current_holder_group_id = this.scorecard.data.data_settings.indicator_holders.length + 1;
    this.current_holder_group = {
      'id': this.current_holder_group_id,
      'name': 'New Group',
      'indicator_holder_ids': [],
      'background_color': '#ffffff',
      'holder_style': null
    };
    this.enableAddIndicator();
  }

  // enable adding of new Indicator
  enableAddIndicator( current_id: any = null ): void {
    this.current_group_id = this.getStartingIndicatorId() + 1;
    this.current_indicator_holder = {
      'holder_id': this.current_group_id,
      'indicators': []
    };
    this.need_for_indicator = false;
    this.cleanUpEmptyColumns();

    this.addIndicatorHolder(this.current_indicator_holder);
    this.current_holder_group.id = this.current_holder_group_id;
    this.addHolderGroups(this.current_holder_group, this.current_indicator_holder, current_id);
  }

  // enable adding of new Indicator
  enableAddIndicatorFromDragNDrop( current_id: any = null ): void {
    this.current_group_id = this.getStartingIndicatorId() + 1;
    this.current_indicator_holder = {
      'holder_id': this.current_group_id,
      'indicators': []
    };
    this.need_for_indicator = false;
    this.cleanUpEmptyColumns();

    this.addIndicatorHolder(this.current_indicator_holder);
    this.current_holder_group.id = this.current_holder_group_id;
    this.addHolderGroupsFromDragNDrop(this.current_holder_group, this.current_indicator_holder, current_id);
  }

  // try to deduce last number needed to start adding indicator
  getStartingIndicatorId(): number {
    let last_id = 1;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      if ( holder.holder_id > last_id) {
        last_id = holder.holder_id;
      }
    }
    return last_id;
  }

  // try to deduce last number needed to start adding holder group
  getStartingGroupHolderId(): number {
    let last_id = 1;
    for (const group of this.scorecard.data.data_settings.indicator_holder_groups) {
      if ( group.id > last_id) {
        last_id = group.id;
      }
    }
    return last_id;
  }

  //  pass through the scorecard and delete all empty rows
  cleanUpEmptyColumns() {
    let deleted_id = null;
    this.scorecard.data.data_settings.indicator_holders.forEach((item, index) => {
      if (item.indicators.length === 0) {
        deleted_id = item.holder_id;
        this.scorecard.data.data_settings.indicator_holders.splice(index, 1);
      }
    });
    this.scorecard.data.data_settings.indicator_holder_groups.forEach( (group, groupIndex) => {
      group.indicator_holder_ids.forEach((item, index) => {
        if (item === deleted_id) {
          group.indicator_holder_ids.splice(index, 1);
        }
        if (group.indicator_holder_ids.length === 0) {
          this.scorecard.data.data_settings.indicator_holder_groups.splice(groupIndex, 1);
        }
      });
    });
  }

  deleteEmptyGroups() {
    this.scorecard.data.data_settings.indicator_holder_groups.forEach( (group, groupIndex) => {
      if ( group.indicator_holder_ids.length === 0) {
        this.scorecard.data.data_settings.indicator_holder_groups.splice(groupIndex, 1);
      }
    });
  }

  //  function to remove the indicator holder group form the scorecard
  deleteGroup(holderGroup) {
    for ( const holder of holderGroup.indicator_holder_ids ) {
      this.scorecard.data.data_settings.indicator_holders.forEach((item, index) => {
        if (item.holder_id === holder) {
          this.scorecard.data.data_settings.indicator_holders.splice(index, 1);
        }
      });
    }
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((item, index) => {
      if (item.id === holderGroup.id) {
        this.scorecard.data.data_settings.indicator_holder_groups.splice(index, 1);
      }
    });
  }

  //  this will enable updating of indicator
  updateIndicator(indicator: any): void {
    this.current_indicator_holder = indicator;
    this.need_for_indicator = true;
    console.log('indicator:', this.current_indicator_holder);
    this.scorecard.data.data_settings.indicator_holder_groups.forEach( (group, groupIndex) => {
      if (group.indicator_holder_ids.indexOf(indicator.holder_id) > -1) {
        this.current_holder_group = group;
        this.current_holder_group_id = group.id;
      }
    });
    this.cleanUpEmptyColumns();
  }

  //  deleting indicator from score card
  deleteIndicator(indicator_to_delete): void {
    this.scorecard.data.data_settings.indicator_holders.forEach((holder, holder_index) => {
      holder.indicators.forEach((indicator, indicator_index) => {
        if ( indicator.id === indicator_to_delete.id) {
          holder.indicators.splice(indicator_index, 1);
        }
      });
    });
    this.cleanUpEmptyColumns();
  }

  //  A function used to decouple indicator list and prepare them for a display
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

  //  simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string {
    const title = [];
    for ( const data of holder.indicators ) {
      title.push(data.title);
    }
    return title.join(' / ');
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

  //  check if the indicator is already added in a scorecard
  indicatorExist(holders, indicator): boolean {
    let check = false;
    for ( const holder of holders ) {
      for ( const indicatorValue of holder.indicators ) {
        if (indicatorValue.id === indicator.id) {
          check = true;
        }
      }
    }
    return check;
  }

  //  check if this is the current selected group
  is_current_group(group: any): boolean {
    let check = false;
    if (group.id === this.current_holder_group.id) {
      check = true;
    }
    return check;
  }

  //  check if this is the current selected indicator
  is_current_indicator(indicator: any): boolean {
    let check = false;
    if ( indicator.holder_id === this.current_indicator_holder.holder_id ) {
      check = true;
    }
    return check;
  }

  // enable text editor popup
  showTextEditor() {
    this.show_editor = !this.show_editor;
  }

  addAditionalLabel() {
    if (this.newLabel !== '') {
      this.scorecard.data.additional_labels.push(this.newLabel);
      for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
        for (const indicator of holder.indicators ) {
          indicator.additional_label_values[this.newLabel] = '';
        }
      }
      this.newLabel = '';
    }
  }

  deleteAdditionalLabel(label) {
    this.scorecard.data.additional_labels.splice(this.scorecard.data.additional_labels.indexOf(label), 1);
    for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
      for (const indicator of holder.indicators ) {
        indicator.additional_label_values[this.newLabel] = '';
      }
    }
    console.log(this.scorecard.data.data_settings);
  }

  getIndicatorLabel(indicator, label) {
    const labels = [];
    for ( const data of indicator.indicators ) {
      if (data.additional_label_values[label] !== null && data.additional_label_values[label] !== '') {
        labels.push(data.additional_label_values[label]);
      }
    }
    return labels.join(' / ');
  }

  //  saving scorecard details
  saveScoreCard(action: string = 'save'): void {
    //  display error if some fields are missing
    if (this.scorecard.data.data_settings.indicator_holders.length === 0 || this.scorecard.data.header.title === '' || this.scorecard.data.header.description === '') {
      this.someErrorOccured = true;
      if (this.scorecard.data.header.description === '') {
        this.discription_element.nativeElement.focus();
      }
      if (this.scorecard.data.header.title === '') {
        this.title_element.nativeElement.focus();
      }
      setTimeout(() => {
        this.someErrorOccured = false;
      }, 3000);

    }else {
      //  delete all empty indicators if any
      this.cleanUpEmptyColumns();

      //  add related indicators to another datastore to enable flexible data analysis
      this.scorecard.data.data_settings.indicator_holders.forEach((holder) => {
        holder.indicators.forEach( (indicator) => {
          if ( indicator.bottleneck_indicators.length !== 0 ) {
            this.scorecardService.addRelatedIndicator(indicator.id, indicator.bottleneck_indicators);
          }
        });
      });

      //  post the data
      this.saving_scorecard = true;
      if (action === 'save') {
        this.scorecardService.create(this.scorecard).subscribe(
          (data) => {
            this.saving_scorecard = false;
            this.scorecardService.addScorecardToStore( this.scorecard.id, this.scorecard.data );
            this.router.navigate(['view', this.scorecard.id]);
          },
          error => {
            this.saving_error = true;
            this.saving_scorecard = false;
          }
        );
      }else {
        this.scorecardService.update(this.scorecard).subscribe(
          (data) => {
            this.saving_scorecard = false;
            const scorecard_item = {
              id: this.scorecard.id,
              name: this.scorecard.data.header.title,
              data: this.scorecard.data,
              can_see: true,
              can_edit: true,
              deleting: false,
              hoverState: 'notHovered',
              confirm_deleting: false,
              deleted: false,
              error_deleting: false
            };
            this.store.dispatch(new UpdateScorecardAction(scorecard_item));
            this.router.navigate(['view', this.scorecard.id]);
          },
          error => {
            this.saving_error = true;
            this.saving_scorecard = false;
          }
        );
      }


    }


  }

  /**
   * Bottleneck indicator issues
   * @param indicator
   */
  showBotleneckEditor(indicator) {
    if (this.show_bottleneck_indicators) {
      for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
        for (const item of holder.indicators ) {
          if (item.id === indicator.id) {
            item.bottleneck_indicators = this.bottleneck_card.indicator.bottleneck_indicators;
          }
        }
      }
    }else {
      this.bottleneck_card.indicator = indicator;
      this.bottleneck_card.indicator_ready = true;
    }

    this.show_bottleneck_indicators = !this.show_bottleneck_indicators;
  }

  //  deal with all issues during group type switching between dataelent, indicators and datasets
  switchBottleneckType(current_type): void {
    this.bottleneck_card.listReady = false;
    this.bottleneck_card.groupQuery = null;
    if (current_type === 'indicators') {
      this.bottleneck_card.current_groups = this.indicatorGroups;
      if (this.bottleneck_card.current_groups.length !== 0) {
        this.load_bottleneck_card_list(this.bottleneck_card.current_groups[0].id, current_type);
      }
    }else if (current_type === 'dataElements') {
      this.bottleneck_card.current_groups = this.dataElementGroups;
      if (this.bottleneck_card.current_groups.length !== 0) {
        this.load_bottleneck_card_list(this.bottleneck_card.current_groups[0].id, current_type);
      }
    }else if (current_type === 'datasets') {
      this.bottleneck_card.current_groups = this.dataset_types;
      if (this.bottleneck_card.current_groups.length !== 0) {
        this.load_bottleneck_card_list(this.bottleneck_card.current_groups[0].id, current_type);
      }
    }else if (current_type === 'programs') {
      this.bottleneck_card.current_groups = this.programs;
      if (this.bottleneck_card.current_groups.length !== 0) {
        this.load_bottleneck_card_list(this.bottleneck_card.current_groups[0].id, current_type);
      }
    }else if (current_type === 'event') {
      this.bottleneck_card.current_groups = this.programs;
      if (this.bottleneck_card.current_groups.length !== 0) {
        this.load_bottleneck_card_list(this.bottleneck_card.current_groups[0].id, current_type);
      }
    }else if (current_type === 'functions') {
      this.bottleneck_card.current_groups = this.functions;
      if (this.bottleneck_card.current_groups.length !== 0) {
        this.load_list(this.bottleneck_card.current_groups[0].id, current_type);
      }
    }else {

    }

  }

  //  load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_bottleneck_card_list(group_id, current_type): void {
    this.bottleneck_card.listQuery = null;
    this.bottleneck_card.activeGroup = group_id;
    this.bottleneck_card.listReady = true;
    this.bottleneck_card.current_listing = [];
    this.bottleneck_card.done_loading_list = false;
    this.bottleneck_card.error_loading_list = {};
    if ( current_type === 'indicators' ) {
      let load_new = false;
      for ( const group  of this.indicatorGroups ) {
        if ( group.id === group_id ) {
          if (group.indicators.length !== 0) {
            this.bottleneck_card.current_listing = group.indicators;
            this.bottleneck_card.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.indicatorService.load(group_id).subscribe(
          indicators => {
            this.bottleneck_card.current_listing = indicators.indicators;
            this.bottleneck_card.done_loading_list = true;
            for ( const group  of this.indicatorGroups ) {
              if ( group.id === group_id ) {
                group.indicators = indicators.indicators;
              }
            }
          },
          error => {
            this.bottleneck_card.error_loading_list.occurred = true;
            this.bottleneck_card.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }

    }else if ( current_type === 'dataElements' ) {
      let load_new = false;
      for ( const group  of this.dataElementGroups ) {
        if ( group.id === group_id ) {
          if (group.dataElements.length !== 0) {
            this.bottleneck_card.current_listing = group.dataElements;
            this.bottleneck_card.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.dataElementService.load(group_id).subscribe(
          dataElements => {
            this.bottleneck_card.current_listing = dataElements.dataElements;
            this.bottleneck_card.done_loading_list = true;
            for ( const group  of this.dataElementGroups ) {
              if ( group.id === group_id ) {
                group.dataElements = dataElements.dataElements;
              }
            }
          },
          error => {
            this.bottleneck_card.error_loading_list.occurred = true;
            this.bottleneck_card.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }
    }else if ( current_type === 'datasets' ) {
      this.bottleneck_card.current_listing = [];
      let group_name = '';
      for (const dataset_group of this.dataset_types ) {
        if (dataset_group.id === group_id) {
          group_name = dataset_group.name;
        }
      }
      for ( const dataset of this.datasets ) {
        this.bottleneck_card.current_listing.push(
          {id: dataset.id + group_id, name: group_name + ' ' + dataset.name}
        );
      }
      this.bottleneck_card.done_loading_list = true;
    }else if ( current_type === 'programs' ) {
      let load_new = false;
      for ( const group  of this.programs ) {
        if ( group.id === group_id ) {
          if (group.indicators.length !== 0) {
            this.bottleneck_card.current_listing = group.indicators;
            this.bottleneck_card.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.programService.load(group_id).subscribe(
          indicators => {
            this.bottleneck_card.current_listing = indicators.programs[0].programIndicators;
            this.bottleneck_card.done_loading_list = true;
            for ( const group  of this.programs ) {
              if ( group.id === group_id ) {
                group.indicators = indicators.programs.programIndicators;
              }
            }
          },
          error => {
            this.bottleneck_card.error_loading_list.occurred = true;
            this.bottleneck_card.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }

    }else if ( current_type === 'event' ) {
      let load_new = false;
      for ( const group  of this.events ) {
        if ( group.id === group_id ) {
          if (group.indicators.length !== 0) {
            this.bottleneck_card.current_listing = group.indicators;
            this.bottleneck_card.done_loading_list = true;
          }else {
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.eventService.load(group_id).subscribe(
          indicators => {
            // noinspection TypeScriptUnresolvedVariable
            for (const event_data of indicators.programDataElements ) {
              if (event_data.valueType === 'INTEGER_ZERO_OR_POSITIVE' || event_data.valueType === 'BOOLEAN' ) {
                this.bottleneck_card.current_listing.push(event_data);
              }
            }
            this.bottleneck_card.done_loading_list = true;
            for ( const group  of this.events ) {
              if ( group.id === group_id ) {
                group.indicators = this.bottleneck_card.current_listing;
              }
            }
          },
          error => {
            this.bottleneck_card.error_loading_list.occurred = true;
            this.bottleneck_card.error_loading_list.message = 'Something went wrong when trying to load Indicators';
          }
        );
      }

    }else if ( current_type === 'functions' ) {
      for ( const group  of this.functions ) {
        if ( group.id === group_id ) {
          if (group.rules.length !== 0) {
            this.bottleneck_card.current_listing = group.rules;
            this.bottleneck_card.done_loading_list = true;
          }else {
            this.bottleneck_card.done_loading_list = true;
            this.bottleneck_card.current_listing = [];
          }
        }
      }
    }else {

    }
  }

  //  a function to check if bottleneck indicator exists
  botteneckIndicatorExist(item): boolean {
    let check  = false;
    if (this.bottleneck_card.indicator.hasOwnProperty('bottleneck_indicators') ) {
      for ( const indicator of this.bottleneck_card.indicator.bottleneck_indicators ) {
        if ( indicator.id === item.id) {
          check = true;
        }
      }
    }
    return check;
  }

  //  a function that displays a card to add bottleneck indicators
  load_bottleneck_card_item(item) {
    if (this.botteneckIndicatorExist(item)) {
      this.removeBottleneckIndicator(item);
    }else {
      if (this.bootleneck_group_type === 'functions') {
        item.bottleneck_title = item.name;
        item.baseline = null;
        item.target = null;
        item.function = this.bottleneck_card.activeGroup;
      }else {
        item.bottleneck_title = item.name;
        item.baseline = null;
        item.target = null;
      }
      this.bottleneck_card.indicator.bottleneck_indicators.push(item);
    }
  }

  //  a function to remove bottleneck indicator
  removeBottleneckIndicator(item) {
    this.bottleneck_card.indicator.bottleneck_indicators.forEach( (value, index) => {
      if ( value.id === item.id ) {
        this.bottleneck_card.indicator.bottleneck_indicators.splice(index, 1);
      }
    });
  }

  //  remove a set of legend
  showDeleteWarnig(index) {
    if ( this.scorecard.data.data_settings.indicator_holders.length === 0) {
      this.deleteLegand(index);
    }else {
      this.show_delete_legend[index] = true;
    }

  }

  cancelDeleteLegend(index) {
    this.show_delete_legend[index] = false;
  }

  deleteLegand(index) {
    this.scorecard.data.legendset_definitions.splice(index, 1);
    this.show_delete_legend[index] = false;
    this.scorecard.data.data_settings.indicator_holders.forEach( (holder) => {
      holder.indicators.forEach( (indicator) => {
        const legend_length = this.scorecard.data.legendset_definitions.length - 2;
        const indicator_legend = [];
        let initial_value = 100;

        for (const legend of this.scorecard.data.legendset_definitions ) {
          if (!legend.hasOwnProperty('default')) {
            indicator_legend.push(
              {
                color: legend.color,
                min: initial_value - Math.round(100 / legend_length),
                max: initial_value
              }
            );
          }
          initial_value = initial_value - Math.round(100 / legend_length);
        }
        indicator.legendset = indicator_legend;
      });
    });
  }

  //  add a legend set
  showAddWarning() {
    if ( this.scorecard.data.data_settings.indicator_holders.length === 0) {
      this.addLegend();
    }else {
      this.show_add_legend = true;
    }
  }

  addLegend() {
    this.show_add_legend = false;
    const index = this.findFirstDefaultLegend();
    const new_legend = {
      color: this.new_color,
      definition: this.new_definition
    };
    this.scorecard.data.legendset_definitions.splice(index, 0 , new_legend);
    this.new_color = '#fff';
    this.new_definition = '';
    //  loop through indicators and regenerate the legend set
    this.scorecard.data.data_settings.indicator_holders.forEach( (holder) => {
      holder.indicators.forEach( (indicator) => {
        const legend_length = this.scorecard.data.legendset_definitions.length - 2;
        const indicator_legend = [];
        let initial_value = 100;

        for (const legend of this.scorecard.data.legendset_definitions ) {
          if (!legend.hasOwnProperty('default')) {
            indicator_legend.push(
              {
                color: legend.color,
                min: initial_value - Math.round(100 / legend_length),
                max: initial_value
              }
            );
          }
          initial_value = initial_value - Math.round(100 / legend_length);
        }
        indicator.legendset = indicator_legend;
      });
    });
  }

  getIndicatorLegendSet() {
    const legend_length = this.scorecard.data.legendset_definitions.length - 2;
    const indicator_legend = [];
    let initial_value = 100;

    for (const legend of this.scorecard.data.legendset_definitions ) {
      if (!legend.hasOwnProperty('default')) {
        indicator_legend.push(
          {
            color: legend.color,
            min: initial_value - Math.round(100 / legend_length),
            max: initial_value
          }
        );
      }
      initial_value = initial_value - Math.round(100 / legend_length);
    }
    return indicator_legend;
  }

  cancelAddLegend() {
    this.show_add_legend = false;
  }

  findFirstDefaultLegend() {
    let i = 0; let index = 0;
    for ( const item of this.scorecard.data.legendset_definitions ) {
      if ( item.hasOwnProperty('default') ) {
        index = i - 1;
      }
      i++;
    }
    return index;
  }


  transferDataSuccess($event, drop_area: string, object: any) {
    console.log('droped here', $event);
    if (drop_area === 'group') {
      //  check if someone is trying to reorder items within the scorecard

      if ( $event.dragData.hasOwnProperty('holder_id') ) {

        const last_holder = ( object.indicator_holder_ids.length === 0 ) ? 0 : object.indicator_holder_ids.length - 1;
        if (object.indicator_holder_ids.indexOf($event.dragData.holder_id) === -1) {
          this.deleteHolder( $event.dragData );
          this.insertHolder( $event.dragData, this.getHolderById(object.indicator_holder_ids[last_holder]), 1);
          this.updateIndicator($event.dragData);
        }else { }
        this.deleteEmptyGroups();
      }else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
        if ($event.dragData.id !== object.id) {
          this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, group_index) => {
            if ( group.id === $event.dragData.id) {
              this.scorecard.data.data_settings.indicator_holder_groups.splice(group_index, 1);
            }
          });
          this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, group_index) => {
            if ( group.id === object.id && this.getgroupById($event.dragData.id) === null) {
              this.scorecard.data.data_settings.indicator_holder_groups.splice(group_index, 0, $event.dragData);
            }
          });
        }

      }else {
        const last_holder_position = ( object.indicator_holder_ids.length === 0 ) ? 0 : object.indicator_holder_ids.length - 1;
        this.updateIndicator(this.getHolderById(object.indicator_holder_ids[last_holder_position]));
        this.enableAddIndicator(this.current_indicator_holder.holder_id);
        this.load_item($event.dragData);
      }
    }else if (drop_area === 'table_data') {
      //  check if someone is trying to reorder items within the scorecard
      if ( $event.dragData.hasOwnProperty('holder_id') ) {
        if ( $event.dragData.holder_id === object.holder_id ) {
          console.log('cant move item to itself');
        }else {
          const position = this.getHolderPosition($event.dragData, object);
          this.deleteHolder( $event.dragData );
          this.insertHolder( $event.dragData, object, position);
          this.updateIndicator($event.dragData);
        }
        this.deleteEmptyGroups();
      }else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) { }else {
        this.updateIndicator(object);
        this.enableAddIndicatorFromDragNDrop(this.current_indicator_holder.holder_id);
        this.load_itemFromDragNDrop($event.dragData);
      }
    }else if (drop_area === 'new-group') {
      this.createGroup();
      if ( $event.dragData.hasOwnProperty('holder_id') ) {
        const last_holder = ( this.getgroupById(this.current_holder_group_id).indicator_holder_ids.length === 0 ) ? 0 : this.getgroupById(this.current_holder_group_id).indicator_holder_ids.length - 1;
        if (this.getgroupById(this.current_holder_group_id).indicator_holder_ids.indexOf($event.dragData.holder_id) === -1) {
          this.deleteHolder( $event.dragData );
          this.insertHolder( $event.dragData, this.getHolderById(this.getgroupById(this.current_holder_group_id).indicator_holder_ids[last_holder]), 1);
          this.updateIndicator($event.dragData);
        }else { }
      }else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {

      }else {
        this.enableAddIndicator(this.current_indicator_holder.holder_id);
        this.load_item($event.dragData);
      }
    }else {
      if ( $event.dragData.hasOwnProperty('holder_id') ) {

      }else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {

      }else {
        this.enableAddIndicator(this.current_indicator_holder.holder_id);
        this.load_item($event.dragData);
      }
    }
  }

  getgroupById(group_id) {
    let return_id = null;
    for ( const group of this.scorecard.data.data_settings.indicator_holder_groups ) {
      if ( group.id === group_id ) {
        return_id = group;
        break;
      }
    }
    return return_id;
  }

  getHolderById( holder_id ) {
    let return_id = null;
    for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
      if ( holder.holder_id === holder_id ) {
        return_id = holder;
        break;
      }
    }
    return return_id;
  }

  deleteHolder( holder_to_delete ) {
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, holder_index) => {
      group.indicator_holder_ids.forEach((holder, indicator_index) => {
        if ( holder === holder_to_delete.holder_id) {
          group.indicator_holder_ids.splice(indicator_index, 1);
        }
      });
    });
  }

  insertHolder( holder_to_insert, current_holder, num: number ) {
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, holder_index) => {
      group.indicator_holder_ids.forEach((holder, indicator_index) => {
        if ( holder === current_holder.holder_id && group.indicator_holder_ids.indexOf(holder_to_insert.holder_id) === -1) {
          group.indicator_holder_ids.splice( indicator_index + num, 0, holder_to_insert.holder_id );
        }
      });
    });
    this.cleanUpEmptyColumns();
  }

  //  Dertimine if indicators are in the same group and say whether the first is larger of not
  getHolderPosition(holder_to_check, current_holder) {
    let holders_in_same_group = false;
    let holder_group = null;
    let increment_number = 0;
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, holder_index) => {
      if (group.indicator_holder_ids.indexOf(holder_to_check.holder_id) !== -1 && group.indicator_holder_ids.indexOf(current_holder.holder_id) !== -1) {
        holders_in_same_group = true;
        holder_group = group.indicator_holder_ids;
      }
    });
    if (holders_in_same_group) {
      if ( holder_group.indexOf(holder_to_check.holder_id) > holder_group.indexOf(current_holder.holder_id)) {
        increment_number = 0;
      }else {
        increment_number = 1;
      }
    }
    return increment_number;
  }

  // helper function to dynamical provide colspan attribute for a group
  getGroupColspan(group_holders) {
    let colspan = 0;
    for (const holder of this.scorecard.data.data_settings.indicator_holders ) {
      if (group_holders.indexOf(holder.holder_id) !== -1) {
        if (this.selected_periods.length === 0) {
          colspan++;
        }else {
          for (const per of this.selected_periods) {
            colspan++;
          }
        }
      }
    }
    return colspan;
  }


  ngOnDestroy() {
    // tinymce.remove(this.editor);
  }


}
