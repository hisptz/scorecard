import {
  Component, OnInit, AfterViewInit, ViewChild,
  OnDestroy
} from '@angular/core';
import {ScorecardService} from '../shared/services/scorecard.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {FilterService} from '../shared/services/filter.service';
import {OrgUnitService} from '../shared/services/org-unit.service';
import {ScorecardComponent} from './scorecard/scorecard.component';
import {animate, style, transition, trigger} from '@angular/animations';
import {ScoreCard} from '../shared/models/scorecard';
import {TreeComponent} from 'angular-tree-component';
import {DataService} from '../shared/services/data.service';


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

  selected_orgunits: any[] = [];
  selected_periods: any = [];
  period_type: string = 'Quarterly';
  showOrgTree: boolean = true;
  showPerTree: boolean = true;

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

  show_average_in_row: boolean = false;
  show_average_in_column: boolean = false;

  sortAscending: boolean = true;

  shown_records: number = 0;
  average_selection: string = 'all';
  show_rank: boolean = false;
  have_authorities: boolean = true;
  orgUnitlength: number = 0;

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

  // listen to changes in period
  updatePeriod( period ) {
    console.log( period );
  }

  // listen to changes in period
  updateOrgUnitModel( orgunits ) {
    console.log( orgunits );
  }



  isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  ngOnInit() {
    // loading organisation units
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
        //   // this.loadScoreCard();
        // }
      });

  }

  ngAfterViewInit() {

  }


  // a function that will be used to load scorecard
  loadScoreCard( orgunit: any = null ) {
    this.showOrgTree = true;
    this.showPerTree = true;
    this.orgUnitlength = (this.orgUnit.children) ? this.orgUnit.children.length + 1 : 1;
    this.childScoreCard.loadScoreCard();
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
      this.orgunit_for_model = this.scorecard.data.orgunit_settings;
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
