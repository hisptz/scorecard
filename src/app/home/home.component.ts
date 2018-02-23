import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import { TourService } from 'ngx-tour-ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {ApplicationState} from '../store/reducers';
import {
  fadeIn, fadeOut, fadeSmooth, hiddenItem, visibilityChanged,
  zoomCard
} from '../shared/animations/basic-animations';
import * as uiAction from '../store/actions/ui.actions';
import * as uiSelectors from '../store/selectors/ui.selectors';
import * as scorecardAction from '../store/actions/scorecard.actions';
import * as scorecardSelector from '../store/selectors/scorecard.selectors';
import tourSteps from '../shared/tourGuide/tour.home';
import {Observable} from 'rxjs/Observable';
import {ScoreCard} from '../shared/models/scorecard';
import {Go} from '../store/actions/router.action';
import {PaginationInstance} from 'ngx-pagination';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.component.css'],
  animations: [
    visibilityChanged,
    hiddenItem,
    fadeIn,
    fadeOut,
    fadeSmooth,
    zoomCard
  ]
})
export class HomeComponent implements OnInit {

  viewTitle$: Observable<string>;
  viewStle$: Observable<string>;
  loaded$: Observable<boolean>;
  loading$: Observable<boolean>;
  complete_percent$: Observable<number>;
  viewStle = 'Card';
  current_hovered_scorecard = '';
  queryterm = '';
  clikedScorecard = '';
  scorecards$: Observable<ScoreCard[]>;
  show_more: boolean = false;
  paginationconfiguration: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 3,
    currentPage: 1
  };

  constructor(
    private store: Store<ApplicationState>,
    private translate: TranslateService,
    public tourService: TourService
  ) {
    this.store.dispatch(new scorecardAction.LoadScorecards());
    this.viewTitle$ = store.select(uiSelectors.getViewTitle);
    this.viewStle$ = store.select(uiSelectors.getViewStyle);
    this.complete_percent$ = store.select(uiSelectors.getHomeLoadingPercent);
    this.scorecards$ = store.select(scorecardSelector.getAllScorecards);
    this.loading$ = store.select(scorecardSelector.getScorecardLoading);
    this.loaded$ = store.select(scorecardSelector.getScorecardLoaded);

    this.tourService.initialize(tourSteps);
  }

  ngOnInit() {}

  createNew() {
    this.store.dispatch(new Go({ path: ['create'] }));
  }

  startTour() {
    this.tourService.start();
    this.store.dispatch(new scorecardAction.LoadScorecards());
  }

  mouseEnter(scorecardId) {
    this.current_hovered_scorecard = scorecardId;
  }

  mouseLeave() {
    this.current_hovered_scorecard = '';
  }

  viewcorecard(scorecard, event ) {
    this.store.dispatch(new Go({  path: ['view', scorecard.id] }));
    event.stopPropagation();
  }

  clearSearchInput() {
    this.queryterm = '';
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    // do this to make sure that the store value for the current listing has been updated
    if (this.viewStle === 'List') {
      this.translate.get('list_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    } else if (this.viewStle === 'Card') {
      this.translate.get('card_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    } else if (this.viewStle === 'Thumbnail') {
      this.translate.get('thumbnail_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    }
  }

  // switching between basic view, list view and card view
  changeView() {
    this.store.dispatch(new uiAction.SetViewStyle(this.viewStle));
    if (this.viewStle === 'List') {
        this.viewStle = 'Card';
        this.translate.get('card_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    } else if (this.viewStle === 'Card') {
        this.viewStle = 'Thumbnail';
        this.translate.get('thumbnail_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    } else if (this.viewStle === 'Thumbnail') {
        this.viewStle = 'List';
        this.translate.get('list_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    }
  }


}
