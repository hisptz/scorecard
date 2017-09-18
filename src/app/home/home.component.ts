import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../store/application.state';
import {ScorecardService} from '../shared/services/scorecard.service';
import {ScoreCard} from '../shared/models/scorecard';
import {DataService} from '../shared/services/data.service';
import {PaginationInstance} from 'ngx-pagination';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {StoreService} from '../shared/services/store-service';
import {ADD_SCORE_CARDS, AddScorecardsAction, DeleteScorecardAction} from '../store/actions/store.data.action';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import * as selectors from '../store/selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
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
    ]),

  ]
})
export class HomeComponent implements OnInit {
  scorecards$: Observable<any[]>;
  scorecards: any = [];
  scorecards_loading$: Observable<boolean>;
  complete_percent$: Observable<number>;
  total = 0;
  loading_message: string;
  queryterm: string = null;
  deleting: boolean[] = [];
  deleted: boolean[] = [];
  error_deleting: boolean[] = [];
  confirm_deleting: boolean[] = [];
  have_authorities = true;
  userInfo: any = {};
  showDetails: boolean[] = [];
  config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 3,
    currentPage: 1
  };

  hoverState: string[] = [];
  constructor(
    private store: Store<ApplicationState>,
    private scoreCardService: ScorecardService,
    private dataService: DataService,
    private storeService: StoreService,
    private router: Router
  ) {
    store.select(state => state.uiState).subscribe(uiState => console.log(uiState));
    this.scorecards$ = store.select(selectors.getScorecards);
    this.scorecards = [];
    this.scorecards_loading$ = store.select(selectors.getLoadingState);
    this.complete_percent$ = store.select(selectors.getLoadingPercent);
    this.loading_message = 'Loading Score cards...';

  }

  ngOnInit() {
    this.dataService.getUserInformation().subscribe(
      (userInfo) => {
        this.scoreCardService.getAllScoreCards( userInfo );
      }
    );

    // this.orgUnitService.prepareOrgunits();
  }

  openscorecard(id, event ) {
    this.router.navigate(['create', 'edit', id]);
    event.stopPropagation();
  }

  // Function to count number of indicators in a scorecard
  countIndicators (scorecard) {
    let count = 0;
    scorecard.data.data_settings.indicator_holders.forEach(
      (holder) => {
        count += holder.indicators.length;
      });
    return count;
  }

  deleteScoreCard( scorecard, event ) {
    event.stopPropagation();
    scorecard.deleting = true;
    scorecard.confirm_deleting = false;
    this.scoreCardService.remove( scorecard ).subscribe(
      data => {
        this.store.dispatch(new DeleteScorecardAction(scorecard.id));
        this.queryterm = '';
      },
      error => {
        scorecard.deleted = false;
        scorecard.deleting = false;
        scorecard.error_deleting = true;
        setTimeout(function() {
          scorecard.error_deleting = false;
        }, 4000);
      }
    );
  }

  mouseEnter(scorecard) {
    scorecard.hoverState = 'hoovered';
    scorecard.showDetails = true;
  }

  mouseLeave(scorecard) {
    scorecard.showDetail = false;
    scorecard.hoverState = 'notHovered';
  }

}
