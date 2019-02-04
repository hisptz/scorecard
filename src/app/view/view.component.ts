import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ApplicationState} from '../store/reducers';
import {ScorecardService} from '../shared/services/scorecard.service';
import * as viewActions from '../store/actions/view.actions';
import * as viewSelectors from '../store/selectors/view.selectors';
import {ScoreCard} from '../shared/models/scorecard';
import {IndicatorHolder} from '../shared/models/indicator-holder';
import {IndicatorHolderGroup} from '../shared/models/indicator-holders-group';
import {Legend} from '../shared/models/legend';
import {Go} from '../store/actions/router.action';
import {LoadOrganisationUnitItem} from '../store/actions/orgunits.actions';
import {getFunctions, getFunctionsLoaded} from '../store/selectors/static-data.selectors';
import * as orgunitSelector from '../store/selectors/orgunits.selectors';
import {ScorecardComponent} from './scorecard/scorecard.component';
import tourSteps from '../shared/tourGuide/tour.view';
import { TourService } from 'ngx-tour-ng-bootstrap';
import {SetSortingColumn} from '../store/actions/view.actions';
import {fadeIn, fadeOut, fadeSmooth, zoomCard} from '../shared/animations/basic-animations';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  animations: [
    fadeIn,
    fadeOut,
    fadeSmooth,
    trigger('visibilityChanged', [
      state('notHovered' , style({
        'opacity': 0,
        'transform': 'scale(0, 0)',
        'position': 'fixed',
        'top': '-100px',
        'box-shadow': '0 0 0px rgba(0,0,0,0.0)',
        'background-color': 'rgba(0,0,0,0.0)',
        'border': '0px solid #ddd'
      })),
      state('hoovered', style({
        'min-height': '580px',
        'width': '90%',
        'left': '5%',
        'position': 'fixed',
        'opacity': 1,
        'top': '100px',
        'z-index': '100',
        '-webkit-box-shadow': '0 0 10px rgba(0,0,0,0.2)',
        'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
        'background-color': 'rgba(255,255,255,1)',
        'border': '1px solid #ddd'
      })),
      transition('notHovered <=> hoovered', animate('500ms 10ms ease-out'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0}),
        animate(600, style({opacity: 1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({opacity: 0}))
      ])
    ]),
    trigger('newhiddenState', [
      transition(':enter', [
        style({
          'transform': 'scale(0) translateY(-100px)',
          'opacity': '0'
        }),
        animate('400ms 100ms ease-in', style({
          'transform': 'scale(1) translateY(0px)',
          'opacity': '1'
        }))
      ]), transition(':leave', [
        animate('400ms 100ms ease-in', style({
          'transform': 'scale(0) translateY(0px)',
          'opacity': '0'
        }))
      ])
    ])
  ]
})
export class ViewComponent implements OnInit {

  scorecard$: Observable<ScoreCard>;
  ordered_holder_list$: Observable<IndicatorHolder[]>;
  additional_labels$: Observable<any>;
  indicator_holders$: Observable<IndicatorHolder[]>;
  indicator_holder_groups$: Observable<IndicatorHolderGroup[]>;
  legendset_definitions$: Observable<Legend[]>;
  scorecard_header$: Observable<any>;
  loaded$: Observable<boolean>;
  orgunit_loading$: Observable<boolean>;
  functions_loaded$: Observable<boolean>;
  metadata_ready$: Observable<boolean>;
  sorting_column$: Observable<string>;


  selectedOrganisationUnits$: Observable<any>;
  selectedPeriod$: Observable<any>;
  functions$: Observable<any>;

  organisation_unit_nodes: any;
  hoverState = 'notHovered';
  indicatorDetails = null;
  showPreview = false;
  sorting_column: string = 'none';

  @ViewChild(ScorecardComponent)
  private childScoreCard: ScorecardComponent;

  constructor(
    private store: Store<ApplicationState>,
    private scorecardService: ScorecardService,
    public tourService: TourService
  ) {
    this.store.dispatch(new viewActions.GetScorecardToView());
    this.store.dispatch(new LoadOrganisationUnitItem());
    this.scorecard$ = this.store.select(viewSelectors.getScorecardToView);
    this.ordered_holder_list$ = this.store.select(viewSelectors.getHoldersList);

    this.additional_labels$ = this.store.select(viewSelectors.getAdditionalLabels);
    this.indicator_holders$ = this.store.select(viewSelectors.getIndicatorHolders);
    this.indicator_holder_groups$ = this.store.select(viewSelectors.getHolderGroups);
    this.legendset_definitions$ = this.store.select(viewSelectors.getLegendSetDefinition);
    this.scorecard_header$ = this.store.select(viewSelectors.getHeader);
    this.loaded$ = this.store.select(viewSelectors.getLoaded);
    this.selectedOrganisationUnits$ = this.store.select(viewSelectors.getSelectedOu);
    this.selectedPeriod$ = this.store.select(viewSelectors.getSelectedPe);
    this.metadata_ready$ = this.store.select(viewSelectors.metaDataReady);
    this.functions$ = this.store.select(getFunctions);
    this.functions_loaded$ = this.store.select(getFunctionsLoaded);
    this.orgunit_loading$ = store.select(orgunitSelector.getOrgunitLoading);
    this.sorting_column$ = store.select(viewSelectors.getSortingColumn);

    this.tourService.initialize(tourSteps);

  }

  startTour() {
    this.tourService.start();
  }

  ngOnInit() {
  }

  goToHomePage() {
    this.store.dispatch(new Go({path: ['']}));
  }

  loadPreview($event) {
    this.indicatorDetails = $event;

    this.hoverState = 'hoovered';
    this.showPreview = true;
  }

  closeModel() {
    this.hoverState = 'notHovered';
    this.showPreview = false;
  }


  setOrgunitNodes(event) {
    this.organisation_unit_nodes = event.orgtree;
  }

  downloadCsv() {
    this.childScoreCard.downloadCSV();
  }

  loadScorecard() {
    this.childScoreCard.loadScoreCard();
  }

  onChangeSort(sorting_column) {
    this.store.dispatch(new viewActions.SetSortingColumn(sorting_column));
  }


}
