import { ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { TourService } from 'ngx-tour-ng-bootstrap';
import { ApplicationState } from '../store/reducers';
import * as scorecardAction from '../store/actions/scorecard.actions';
import * as scorecardSelector from '../store/selectors/scorecard.selectors';
import * as uiAction from '../store/actions/ui.actions';
import * as uiSelectors from '../store/selectors/ui.selectors';
import tourSteps from '../shared/tourGuide/tour.home';
import { ScoreCard } from '../shared/models/scorecard';
import {PaginationInstance} from 'ngx-pagination';
import {Go} from '../store/actions/router.action';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.component.css'],
  animations: [
  trigger('visibilityChanged', [
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
    transition('notHidden <=> hidden', animate('500ms'))
  ])

]
})
export class HomeComponent implements OnInit {

  scorecards$: Observable<ScoreCard[]>;
  loading$: Observable<boolean>;
  loaded$: Observable<boolean>;
  complete_percent$: Observable<number>;
  viewTitle$: Observable<string>;
  viewStle = 'Card';
  current_hovered_scorecard = '';
  queryterm = '';

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
    // set initial translation for view title
    translate.get('list_view').subscribe((val: string) => store.dispatch(new uiAction.SetViewTitle(val)));
    this.viewTitle$ = store.select(uiSelectors.getViewTitle);
    this.complete_percent$ = store.select(uiSelectors.getHomeLoadingPercent);
    this.scorecards$ = store.select(scorecardSelector.getAllScorecards);
    this.loading$ = store.select(scorecardSelector.getScorecardLoading);
    this.loaded$ = store.select(scorecardSelector.getScorecardLoaded);

    this.store.dispatch(new scorecardAction.LoadScorecards());

    this.tourService.initialize(tourSteps);
  }

  ngOnInit() {
  }


  viewcorecard(scorecard, event ) {
    this.store.dispatch(new Go({  path: ['view', scorecard.id] }));
    event.stopPropagation();
  }

  createNew() {
    this.store.dispatch(new Go({ path: ['create'] }));
  }

  mouseEnter(scorecardId) {
    this.current_hovered_scorecard = scorecardId;
  }

  mouseLeave() {
    this.current_hovered_scorecard = '';
  }

  startTour() {
    this.translate.use('en');
    this.tourService.start();
  }

  clearSearchInput(){
    this.queryterm = '';
  }


  changeView() {
    if (this.viewStle === 'List') {
      this.viewStle = 'Card';
      this.translate.get('card_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    } else if (this.viewStle === 'Card') {
      this.viewStle = 'Thumbnail';
      this.translate.get('thumbnail_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    }else if (this.viewStle === 'Thumbnail') {
      this.viewStle = 'List';
      this.translate.get('list_view').subscribe((val: string) => this.store.dispatch(new uiAction.SetViewTitle(val)));
    }
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}
