import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../store/application.state';
import {ScorecardService} from '../shared/services/scorecard.service';
import {ScoreCard} from '../shared/models/scorecard';
import {DataService} from '../shared/services/data.service';
import {PaginationInstance} from 'ngx-pagination';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {StoreService} from '../shared/services/store-service';
import {ADD_SCORE_CARDS, AddScorecardsAction} from '../store/actions/store.data.action';
import {Router} from '@angular/router';

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
    ])
  ]
})
export class HomeComponent implements OnInit {
  scorecards: any = [];
  scorecards_loading: boolean;
  complete_percent: number;
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
    this.scorecards = [];
    this.scorecards_loading = true;
    this.complete_percent = 0;
    this.loading_message = 'Loading Score cards...';
    this.dataService.getUserInformation().subscribe(
      userInfo => {
        this.userInfo = userInfo;

      }
    );
  }

  ngOnInit() {
    this.dataService.getUserInformation().subscribe(
      userInfo => {
        this.userInfo = userInfo;
        this.scoreCardService.getAllScoreCards(this.userInfo).subscribe(
          scorecards => {
            this.scorecards = scorecards;

            this.dataService.sortArrOfObjectsByParam(this.scorecards, 'name', true);
            this.scorecards.forEach((scorecard) => {
              this.deleting[scorecard.id] = false;
              this.hoverState[scorecard.id] = 'notHovered';
              this.confirm_deleting[scorecard.id] = false;
              this.deleted[scorecard.id] = false;
              this.error_deleting[scorecard.id] = false;
            });
            this.scorecards_loading = false;
            this.storeService.dispatch(new AddScorecardsAction(this.scorecards));

          },
          // catch error when there is no scorecard
          error => {
            console.log('SOME ERROR OCCURRED');
            this.loading_message = 'Error Occurred while loading scorecards';
            this.scorecards_loading = false;
          }
        );
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
    this.deleting[scorecard.id] = true;
    this.confirm_deleting[scorecard.id] = false;
    this.scoreCardService.remove( scorecard ).subscribe(
      data => {
        this.deleted[scorecard.id] = true;
        this.error_deleting[scorecard.id] = false;
        this.scorecards.forEach((item, index) => {
          if ( item.id === scorecard.id ) {
            this.scorecards.splice(index, 1);
          }
        });
        this.scoreCardService._scorecards = this.scorecards;
        this.storeService.dispatch(new AddScorecardsAction(this.scorecards));
      },
      error => {
        this.deleted[scorecard.id] = false;
        this.deleting[scorecard.id] = false;
        this.error_deleting[scorecard.id] = true;
        setTimeout(function() {
          this.error_deleting[scorecard.id] = false;
        }, 4000);
      }
    );
  }

  mouseEnter(id) {
    this.hoverState[id] = 'hoovered';
    this.showDetails[id] = true;
  }

  mouseLeave(id) {
    this.showDetails[id] = false;
    this.hoverState[id] = 'notHovered';
  }

}
