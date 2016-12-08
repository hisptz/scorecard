import { Component, OnInit } from '@angular/core';
import {ScoreCard,ScorecardService} from "../shared/services/scorecard.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  scorecards: ScoreCard[];
  scorecards_loading: boolean;
  complete_percent: number;
  total: number = 0;
  loading_message:string;

  constructor( private scoreCardService: ScorecardService) {
    this.scorecards = []
    this.scorecards_loading = true;
    this.complete_percent = 0;
    this.loading_message = "Loading First Score card";
  }

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
                data: scorecard_details
              });
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
    )
  }

  deleteScoreCard( scorecardId ){
    console.log("Score card with id "+scorecardId+" is deleted");
  }

}
