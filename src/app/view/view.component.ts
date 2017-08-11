import {
  Component, OnInit, AfterViewInit, ViewChild, ValueProvider,
  OnDestroy
} from '@angular/core';
import {ScorecardService} from '../shared/services/scorecard.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {FilterService} from '../shared/services/filter.service';
import {OrgUnitService} from '../shared/services/org-unit.service';
// import Key = webdriver.Key;
import {ScorecardComponent} from './scorecard/scorecard.component';
import {animate, style, transition, trigger} from '@angular/animations';
import {ScoreCard} from '../shared/models/scorecard';
import {TreeComponent} from 'angular-tree-component';
import {DataService} from '../shared/services/data.service';


const WINDOW_PROVIDER: ValueProvider = {
  provide: Window,
  useValue: window
};

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0}),
        animate(600, style({opacity: 1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({opacity: 0}))
      ])
    ])
  ]
})
export class ViewComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;
  private indicatorCalls: Subscription[] = [];
  scorecard: ScoreCard;
  scorecardId: string;
  orgUnit: any = {};
  period: any = [];
  orgunits: any[] = [];
  loading: boolean = true;
  orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: 'Select Organisation Unit'
  };

  period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: true,
    placeholder: 'Select period'
  };
  organisationunits: any[] = [];
  periods: any[] = [];
  selected_orgunits: any[] = [];
  selected_periods: any = [];
  period_type: string = 'Quarterly';
  year: number = 2017;
  default_orgUnit: string[] = [];
  default_period: string[] = [];
  showOrgTree: boolean = true;
  showPerTree: boolean = true;
  showAdditionalOptions: boolean = true;

  default_selected_periods: any = [];
  show_details: boolean = false;

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('pertree')
  pertree: TreeComponent;

  @ViewChild(ScorecardComponent)
  private childScoreCard: ScorecardComponent;

  selected_indicator: any = [];
  orgunit_for_model: any = [];

  show_sum_in_row: boolean = false;
  show_sum_in_column: boolean = false;
  show_average_in_row: boolean = false;
  show_average_in_column: boolean = false;

  sortAscending: boolean = true;
  sorting_column: any = 'none';
  hidenColums: any[] = [];

  shown_records: number = 0;
  average_selection: string = 'all';
  show_rank: boolean = false;
  metadata_ready = false;
  have_authorities: boolean = true;
  orgUnitlength: number = 0;

  orgunit_model: any = {
    selection_mode: 'orgUnit',
    selected_level: '',
    selected_group: '',
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    selected_user_orgunit: 'USER_ORGUNIT'
  };
  userInfo: any = {};

  constructor(private scorecardService: ScorecardService,
              private dataService: DataService,
              private activatedRouter: ActivatedRoute,
              private filterService: FilterService,
              private orgunitService: OrgUnitService
  ) {
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        this.scorecardId = params['scorecardid'];
        this.scorecard = this.scorecardService.getEmptyScoreCard();
      });
    this.dataService.getUserInformation().subscribe(
      userInfo => {
        this.userInfo = userInfo;
        //noinspection TypeScriptUnresolvedVariable
        userInfo.userCredentials.userRoles.forEach( (role) => {
          role.authorities.forEach( (ath) => {
            if ( ath === 'ALL') {
              this.have_authorities = true;
            }
          } );

        });
      }
    );

  }

  // check if user can edit scorecard
  canEditScoreCard(): boolean {

    let checker = false;
    if (this.userInfo.hasOwnProperty('id') && this.scorecard.data.hasOwnProperty('user_groups')) {
      if (this.userInfo.id === this.scorecard.data.user.id) {
        checker = true;
      }else {
        if ( this.dataService.checkForUserGroupInScorecard(this.scorecard.data, this.userInfo).edit ) {
          checker = true;
        }
      }
    }
    return checker;
  }

  pushPeriodForward() {
    this.year += 1;
  }

  pushPeriodBackward() {
    this.year -= 1;
  }

  changePeriodType() {
  }

  isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  ngOnInit() {
    // loading organisation units
    this.orgunit_tree_config.loading = true;
    this.scorecardService.load(this.scorecardId).subscribe(
      scorecard_details => {
        this.scorecard = {
          id: this.scorecardId,
          name: scorecard_details.header.title,
          data: scorecard_details
        };
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

        this.orgunit_model = this.scorecard.data.orgunit_settings;

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
        if (this.scorecard.data.hasOwnProperty('periodType')) {
          this.period_type = this.scorecard.data.periodType;
        }
        if (!this.scorecard.data.hasOwnProperty('show_data_in_column')) {
          this.scorecard.data.show_data_in_column = false;
        }

        // if (this.orgunitService.nodes === null) {
        //   this.orgunitService.getOrgunitLevelsInformation()
        //     .subscribe(
        //       (data: any) => {
        //         // assign urgunit levels and groups to variables
        //         this.orgunit_model.orgunit_levels = data.organisationUnitLevels;
        //         this.orgunitService.orgunit_levels = data.organisationUnitLevels;
        //         this.orgunitService.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable
        //           this.orgunit_model.orgunit_groups = groups.organisationUnitGroups;
        //           this.orgunitService.orgunit_groups = groups.organisationUnitGroups;
        //         });
        //
        //         this.orgunitService.getUserInformation().subscribe(
        //           userOrgunit => {
        //             const level = this.orgunitService.getUserHighestOrgUnitlevel( userOrgunit );
        //             this.orgunit_model.user_orgunits = this.orgunitService.getUserOrgUnits( userOrgunit );
        //             this.orgunitService.user_orgunits = this.orgunitService.getUserOrgUnits( userOrgunit );
        //             if (this.orgunit_model.selection_mode === 'Usr_orgUnit') {
        //               this.orgunit_model.selected_orgunits = [];
        //               for ( const item of this.orgunit_model.user_orgunits ) {
        //                 this.orgunit_model.selected_orgunits.push(item);
        //               }
        //             }
        //             const all_levels = data.pager.total;
        //             const orgunits = this.orgunitService.getuserOrganisationUnitsWithHighestlevel( level, userOrgunit );
        //             const use_level = parseInt(all_levels) - (parseInt(level) - 1);
        //             // this.orgunit_model.user_orgunits = orgunits;
        //
        //             // load inital orgiunits to speed up loading speed
        //             this.orgunitService.getInitialOrgunitsForTree(orgunits).subscribe(
        //               (initial_data) => {
        //                 //noinspection TypeScriptUnresolvedVariable
        //                 this.orgUnit = {
        //                   id: initial_data.organisationUnits[0].id,
        //                   name: initial_data.organisationUnits[0].name,
        //                   children: initial_data.organisationUnits[0].children
        //                 };
        //                 // this.orgunit_model.selected_orgunits = [this.orgUnit];
        //                 this.orgUnitlength = this.orgUnit.children.length + 1;
        //
        //                 //noinspection TypeScriptUnresolvedVariable
        //                 this.organisationunits = initial_data.organisationUnits;
        //                 this.orgunit_tree_config.loading = false;
        //                 this.metadata_ready = true;
        //                 // after done loading initial organisation units now load all organisation units
        //                 const fields = this.orgunitService.generateUrlBasedOnLevels(use_level);
        //                 this.orgunitService.getAllOrgunitsForTree1(fields, orgunits).subscribe(
        //                   items => {
        //                     //noinspection TypeScriptUnresolvedVariable
        //                     this.organisationunits = items.organisationUnits;
        //                     //noinspection TypeScriptUnresolvedVariable
        //                     this.orgunitService.nodes = items.organisationUnits;
        //                     // activate organisation units
        //                     for ( const active_orgunit of this.orgunit_model.selected_orgunits ) {
        //                       this.activateNode(active_orgunit.id, this.orgtree);
        //                     }
        //                     this.prepareOrganisationUnitTree(this.organisationunits, 'parent');
        //                   },
        //                   error => {
        //                     console.log('something went wrong while fetching Organisation units');
        //                     this.orgunit_tree_config.loading = false;
        //                   }
        //                 );
        //               },
        //               error => {
        //                 console.log('something went wrong while fetching Organisation units');
        //                 this.orgunit_tree_config.loading = false;
        //               }
        //             );
        //
        //           }
        //         );
        //       }
        //     );
        // }else {
        //   this.orgunit_tree_config.loading = false;
        //   this.default_orgUnit = [this.orgunitService.nodes[0].id];
        //   this.orgUnit = {
        //     id: this.orgunitService.nodes[0].id,
        //     name: this.orgunitService.nodes[0].name,
        //     children: this.orgunitService.nodes[0].children
        //   };
        //   // this.orgunit_model.selected_orgunits = [this.orgUnit];
        //   this.orgUnitlength = this.orgUnit.children.length + 1;
        //   this.organisationunits = this.orgunitService.nodes;
        //   this.orgunit_model.orgunit_levels = this.orgunitService.orgunit_levels;
        //   this.orgunit_model.user_orgunits = this.orgunitService.user_orgunits;
        //   this.orgunit_model.orgunit_groups = this.orgunitService.orgunit_groups;
        //   // activate organisation units
        //   if (this.orgunit_model.selection_mode === 'Usr_orgUnit') {
        //     this.orgunit_model.selected_orgunits = this.orgunit_model.user_orgunits;
        //   }
        //
        //   this.prepareOrganisationUnitTree(this.organisationunits, 'parent');
        //   // TODO: make a sort level information dynamic
        //   this.metadata_ready = true;
        //   // this.loadScoreCard();
        // }
      });

  }

  ngAfterViewInit() {

  }


  // this function is used to sort organisation unit
  prepareOrganisationUnitTree(organisationUnit, type: string = 'top') {
    if (type === 'top') {
      if (organisationUnit.children) {
        organisationUnit.children.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });
        organisationUnit.children.forEach((child) => {
          this.prepareOrganisationUnitTree(child, 'top' );
        });
      }
    }else {
      organisationUnit.forEach((orgunit) => {
        console.log(orgunit);
        if (orgunit.children) {
          orgunit.children.sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
          orgunit.children.forEach((child) => {
            this.prepareOrganisationUnitTree(child, 'top');
          });
        }
      });
    }
  }

  // prepare a proper name for updating the organisation unit display area.
  getProperPreOrgunitName(): string {
    let name = '';
    if ( this.orgunit_model.selection_mode === 'Group' ) {
      const use_value = this.orgunit_model.selected_group.split('-');
      for ( const single_group of this.orgunit_model.orgunit_groups ) {
        if ( single_group.id === use_value[1] ) {
          name = single_group.name + ' in';
        }
      }
    }else if ( this.orgunit_model.selection_mode === 'Usr_orgUnit' ) {
      if ( this.orgunit_model.selected_user_orgunit === 'USER_ORGUNIT_CHILDREN') { name = 'Children of '; }
      if ( this.orgunit_model.selected_user_orgunit === 'USER_ORGUNIT_GRANDCHILDREN') { name = 'Grand Children of'; }
    }else if ( this.orgunit_model.selection_mode === 'Level' ) {
      const use_level = this.orgunit_model.selected_level.split('-');
      for ( const single_level of this.orgunit_model.orgunit_levels ) {
        if ( single_level.level === use_level[1] ) {
          name = single_level.name + ' in';
        }
      }
    }else {
      name = '';
    }
    return name;
  }

  // a function that will be used to load scorecard
  loadScoreCard( orgunit: any = null ) {
    this.showOrgTree = true;
    this.showPerTree = true;
    this.orgUnitlength = (this.orgUnit.children) ? this.orgUnit.children.length + 1 : 1;
    this.childScoreCard.loadScoreCard();
  }

  // setting the period to next or previous
  setPeriod(type , selected_periods) {
    // this.selected_periods = [];
    // if (type === 'down') {
    //   this.periods = this.filterService.getPeriodArray(this.period_type, this.filterService.getLastPeriod(selected_periods, this.period_type).substr(0,4));
    //   this.activateNode(this.filterService.getLastPeriod(selected_periods, this.period_type), this.pertree);
    //   this.period = [{
    //     id:this.filterService.getLastPeriod(selected_periods, this.period_type),
    //     name:this.getPeriodName(this.filterService.getLastPeriod(selected_periods, this.period_type))
    //   }];
    //
    // }
    // if (type === 'up') {
    //   this.periods = this.filterService.getPeriodArray(this.period_type, this.filterService.getNextPeriod(selected_periods, this.period_type).substr(0,4));
    //   this.activateNode(this.filterService.getNextPeriod(selected_periods, this.period_type), this.pertree);
    //   this.period = [{
    //     id:this.filterService.getNextPeriod(selected_periods, this.period_type),
    //     name:this.getPeriodName(this.filterService.getNextPeriod(selected_periods, this.period_type))
    //   }];
    // }
    // setTimeout(() => {
    //   this.loadScoreCard()
    // }, 5);
  }


  // get updated scorecard from scorecard component
  getUpdatedScorecard(scorecard) {

  }
  // prepare scorecard data and download them as csv
  downloadCSV(orgunitId) {
    this.childScoreCard.downloadCSV();
  }

  // invoke a default browser print function
  browserPrint() {
    window.print();
  }

  // load a preview function
  loadPreview($event) {
    this.selected_indicator = [];
    // prepare indicators
    if ($event.period === null) {
      this.default_selected_periods = this.selected_periods;
    }else {
      this.default_selected_periods = [$event.period];
    }
    if ($event.holderGroup === null) {
      this.selected_indicator = [$event.indicator];
    }else {
      for ( const holderid of $event.holderGroup.indicator_holder_ids ) {
        for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
          if ( holder.holder_id === holderid ) {
            this.selected_indicator.push(holder);
          }
        }
      }
    }

    // prepare organisation units
    if ($event.ou === null) {
      this.orgunit_for_model = this.orgunit_model;
    }else {
      const node = this.orgtree.treeModel.getNodeById($event.ou);
      this.orgunit_for_model = node.data;
    }
    this.show_details = true;
  }

  removeModel() {
    this.show_details = false;
  }

  // a function to prepare a list of indicators to pass into a table
  getIndicatorsList(scorecard): string[] {
    const indicators = [];
    for ( const holder of scorecard.data.data_settings.indicator_holders ) {
      for ( const indicator of holder.indicators ) {
        indicators.push(indicator);
      }
    }
    return indicators;
  }

  // a function to check if selections are fine and one can update a scorecard
  checkSelectionCompletion(): boolean {
    let checker = false;
    if (this.selected_periods.length >= 1 && this.orgunit_model.selected_orgunits.length >= 1) {
      checker = true;
    }
    return checker;
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  // help function to help on closing the indicator modal popup
  getDetails($event) {
    this.show_details = $event;
  }

  showOptions() {
    this.showAdditionalOptions = !this.showAdditionalOptions;
  }

  // hiding columns
  hideColums() {
    console.log(this.hidenColums);
  }

  private findOrgunitIndicatorValue(orgunit_id: string, indicator_id: string) {
    let val: number = 0;
    for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
      for ( const indicator of holder.indicators ) {
        if (orgunit_id in indicator.values && indicator.values[orgunit_id] != null && indicator.id === indicator_id) {
          val = parseFloat(indicator.values[orgunit_id]);
        }
      }
    }
    return val;
  }

  ngOnDestroy () {
    if ( this.subscription ) {
      this.subscription.unsubscribe();
    }

    for ( const subscr of this.indicatorCalls ) {
      if ( subscr ) {
        subscr.unsubscribe();
      }
    }
  }

}
