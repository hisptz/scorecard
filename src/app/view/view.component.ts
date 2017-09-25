import {
  Component, OnInit, AfterViewInit, ViewChild,
  OnDestroy
} from '@angular/core';
import {ScorecardService} from '../shared/services/scorecard.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {ScorecardComponent} from './scorecard/scorecard.component';
import {animate, style, transition, trigger} from '@angular/animations';
import {DataService} from '../shared/services/data.service';
import {ApplicationState} from '../store/application.state';
import {Store} from '@ngrx/store';
import * as selectors from '../store/selectors';
import {SetSelectedOrgunitAction, SetSelectedPeriodAction} from '../store/actions/store.data.action';
import {Observable} from 'rxjs/Observable';
import {FunctionService} from '../shared/services/function.service';
import {PeriodFilterComponent} from '../shared/components/period-filter/period-filter.component';


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
  scorecard: any;
  scorecardId: string;
  loading: boolean = true;
  firstLoad = true;

  @ViewChild(ScorecardComponent)
  private childScoreCard: ScorecardComponent;

  @ViewChild(PeriodFilterComponent)
  private periodComponent: PeriodFilterComponent;

  selectedOrganisationUnits$: Observable<any>;
  selectedPeriod$: Observable<any>;
  shown_records: number = 0;
  average_selection: string = 'all';
  show_rank: boolean = false;
  functions$: Observable<any>;

  constructor(private scorecardService: ScorecardService,
              private dataService: DataService,
              private activatedRouter: ActivatedRoute,
              private functionService: FunctionService,
              private store: Store<ApplicationState>
  ) {
    this.selectedOrganisationUnits$ = store.select( selectors.getSelectedOrgunit );
    this.selectedPeriod$ = this.store.select( selectors.getSelectedPeriod );
    this.functions$ = this.store.select( selectors.getFunctions );
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        this.scorecardId = params['scorecardid'];
        this.scorecard = this.scorecardService.getEmptyScoreCard();
      });
  }

  ngOnInit() {
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        this.scorecardId = params['scorecardid'];
        // this.scorecard = this.scorecardService.getEmptyScoreCard();
        this.dataService.getUserInformation().subscribe(
          (userInfo: any) => {
            // load functions
            this.functionService.getAll().subscribe((val) => {}, (error) => { });
            // try first to check if selected scorecard is set
            this.store.select(selectors.getSelectedScorecard).subscribe(
              (scorecard_details: any) => {
                if (scorecard_details == null) { // if it is not set load again from server
                  this.scorecardService.load(this.scorecardId).subscribe(
                    (scorecardItem) => {
                      this.setUpScoreCard(scorecardItem, userInfo);
                    }
                  );
                }else { // if it is set use the scorecard from store
                  this.setUpScoreCard(scorecard_details.data, userInfo);
                }
              });
          }
        );
    });
  }

  setUpScoreCard(scorecard_details, userInfo) {
    console.log( scorecard_details)

    this.scorecard = {
      id: this.scorecardId,
      name: scorecard_details.header.title,
      data: scorecard_details,
      can_see: this.dataService.checkForUserGroupInScorecard(scorecard_details, userInfo).see,
      can_edit: this.dataService.checkForUserGroupInScorecard(scorecard_details, userInfo).edit,
    };

    if (!this.scorecard.data.hasOwnProperty('orgunit_settings')) {
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
    }else if (!this.scorecard.data.orgunit_settings.hasOwnProperty('selected_orgunits')) {
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
    if (!this.scorecard.data.hasOwnProperty('show_data_in_column')) {
      this.scorecard.data.show_data_in_column = false;
    }
    this.loading = false;

  }


  ngAfterViewInit() {

  }

  // listen to changes in period on update click
  updatePeriod( period ) {
    this.store.dispatch(new SetSelectedPeriodAction( period ));
    this.loadScoreCard();
  }

  // listen to changes in period on item selections
  changePeriod( period ) {
    console.log('nimefika', period);
    this.store.dispatch(new SetSelectedPeriodAction( period ));
    this.updateOnFirstLoad();
  }

  // listen to changes in organisation unit on Update click
  updateOrgUnit( orgunits ) {
    this.store.dispatch(new SetSelectedOrgunitAction( orgunits ));
    this.loadScoreCard();
  }

 // listen to changes in organisation unit on each click
  changeOrgUnit( orgunits ) {
    console.log('nimefika', orgunits);
    this.store.dispatch(new SetSelectedOrgunitAction( orgunits ));
    this.updateOnFirstLoad();
  }

  isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  // a function that will be used to load scorecard
  loadScoreCard() {
    this.childScoreCard.loadScoreCard();
  }

  updateOnFirstLoad() {
    if (this.firstLoad) {
      this.store.select(selectors.getSelectedPeriod).first((period) => period).subscribe((period) => {
        this.store.select(selectors.getSelectedOrgunit).first((orgunit) => orgunit).subscribe((orgunit) => {
            if (period.hasOwnProperty('items')) {
              if (orgunit.hasOwnProperty('items')) {
                this.store.select(selectors.getFunctions).first(( functions ) => functions).subscribe(( functions ) => {
                  if ( functions.length !== 0 ) {
                    this.childScoreCard.initiateScorecard(period, orgunit);
                    this.firstLoad = false;
                  }
                });
              }
            }
        });
      });
    }
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
  // loadPreview($event) {
  //   this.selected_indicator = [];
  //   // prepare indicators
  //   if ($event.period === null) {
  //     this.default_selected_periods = this.selected_periods;
  //   }else {
  //     this.default_selected_periods = [$event.period];
  //   }
  //   if ($event.holderGroup === null) {
  //     this.selected_indicator = [$event.indicator];
  //   }else {
  //     for ( const holderid of $event.holderGroup.indicator_holder_ids ) {
  //       for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
  //         if ( holder.holder_id === holderid ) {
  //           this.selected_indicator.push(holder);
  //         }
  //       }
  //     }
  //   }
  //
  //   // prepare organisation units
  //   if ($event.ou === null) {
  //     this.orgunit_for_model = this.scorecard.data.orgunit_settings;
  //   }else {
  //     const node = this.orgtree.treeModel.getNodeById($event.ou);
  //     this.orgunit_for_model = node.data;
  //   }
  //   this.show_details = true;
  // }

  removeModel() {

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
