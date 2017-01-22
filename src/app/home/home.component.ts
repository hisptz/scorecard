import {
  Component, OnInit,  style, state, animate, transition, trigger
} from '@angular/core';
import {ScoreCard,ScorecardService} from "../shared/services/scorecard.service";
import {OrgUnitService} from "../shared/services/org-unit.service";
import {DataService} from "../shared/data.service";
import {PaginationInstance} from "ng2-pagination";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('visibilityChanged', [
state('shown' , style({ opacity: 1 })),
  state('hidden', style({ opacity: 0 })),
  transition('shown => hidden', animate('600ms')),
  transition('hidden => shown', animate('300ms')),
])
]
})
export class HomeComponent implements OnInit {

  scorecards: ScoreCard[];
  scorecards_loading: boolean;
  complete_percent: number;
  total: number = 0;
  loading_message:string;
  queryterm: string = null;
  deleting: boolean[] = [];
  deleted: boolean[] = [];
  error_deleting: boolean[] = [];
  confirm_deleting: boolean[] = [];
  constructor( private scoreCardService: ScorecardService, private orgUnitService: OrgUnitService, private dataService: DataService) {
    this.scorecards = []
    this.scorecards_loading = true;
    this.complete_percent = 0;
    this.loading_message = "Loading First Score card";
  }

  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 3,
    currentPage: 1
  };

  ngOnInit() {
    this.scoreCardService.loadAll().subscribe(
      scorecards => {
        let scorecard_count = 0;
        for( let scorecard of scorecards ){
          // loading scorecard details
          this.scoreCardService.load(scorecard).subscribe(
            scorecard_details => {
              this.loading_message = "Loading data for "+scorecard_details.header.title;
              this.scorecards.push({
                id: scorecard,
                name: scorecard_details.header.title,
                data: scorecard_details
              });
              this.dataService.sortArrOfObjectsByParam(this.scorecards, 'name',true);
              this.deleting[scorecard] = false;
              this.confirm_deleting[scorecard] = false;
              this.deleted[scorecard] = false;
              this.error_deleting[scorecard] = false;
              scorecard_count ++;
              // set loading equal to false when all scorecards are loaded
              if(scorecard_count == this.scorecards.length){
                this.loading_message = "Done loading all score cards";
                this.scorecards_loading = false;
              }
              this.complete_percent = (scorecard_count/this.scorecards.length)*100
            },
            // catch error if anything happens when loading scorecard details
            detail_error => {
              this.loading_message = "Error Occurred while loading scorecards";
              this.scorecards_loading = false;
            }
          )
        }
      },
      // catch error when there is no scorecard
      error => {
        console.log('SOME ERROR OCCURRED');
        this.loading_message = "Error Occurred while loading scorecards";
        this.scorecards_loading = false;
      }
    );
    this.orgUnitService.populateOrgunit();
  }

  deleteScoreCard( scorecard ){
    this.deleting[scorecard.id] = true;
    this.confirm_deleting[scorecard.id] = false;
    this.scoreCardService.remove( scorecard ).subscribe(
      data => {
        this.deleted[scorecard.id] = true;
        this.error_deleting[scorecard.id] = false;
        this.scorecards.forEach((item, index) => {
          if( item.id == scorecard.id ){
            this.scorecards.splice(index,1);
          }
        });
      },
      error => {
        this.deleted[scorecard.id] = false;
        this.deleting[scorecard.id] = false;
        this.error_deleting[scorecard.id] = true;
        setTimeout(function() {
          this.error_deleting[scorecard.id] = false;
        }, 4000);
      }
    )
  }


}
