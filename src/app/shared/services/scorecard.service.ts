import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Http, Response} from "@angular/http";
import {Constants} from "../costants";
// Statics
import 'rxjs/add/observable/throw';

// Operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';

export interface ScoreCard {
  id : string;
  name: string;
  data: any;
}

@Injectable()
export class ScorecardService {

  public scorecards: any = [];
  public detailed_scorecard: any = [];
  public related_indicators: any =[];
  private baseUrl: string;

  constructor(private http: Http, private costant: Constants) {
    this.baseUrl = this.costant.root_dir;
  }

  getAll(){
    this.loadAll()
  }

  loadAll() {
    return Observable.create(observor => {
      if(this.scorecards.length != 0){
        observor.next(this.scorecards);
        observor.complete();
      }else{
        this.http.get(this.baseUrl+"api/dataStore/scorecards")
          .map((response: Response) => response.json())
          .catch(this.handleError)
          .subscribe((cards) => {
            this.scorecards = cards;
            observor.next(this.scorecards);
            observor.complete();
          },error => {
            observor.error("Something went wrong while trying to get scorecards");
          })
      }
    });
  }

  load(id: string ) {
    return Observable.create(observor => {
      if(this.detailed_scorecard[id]){
        observor.next(this.detailed_scorecard[id]);
        observor.complete();
      }else{
        this.http.get(`${this.baseUrl}api/dataStore/scorecards/${id}`)
          .map((response: Response) => response.json())
          .catch(this.handleError)
          .subscribe((scorecard) => {
            this.detailed_scorecard[id] = scorecard;
            observor.next(this.detailed_scorecard[id]);
            observor.complete();
          }, error => {
            observor.error("something went wrong");
          });
      }
    });
  }

  create(scorecard: ScoreCard) {
    return Observable.create(observor => {
      this.http.post(this.baseUrl+"api/dataStore/scorecards/"+scorecard.id, scorecard.data)
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe(item => {
          this.scorecards.push(scorecard.id);
          this.detailed_scorecard[scorecard.id] = scorecard.data;
          observor.next(item);
          observor.complete();
        }, error => {
          observor.error("error occurred");
        })
    });
  }

  update(scorecard: ScoreCard) {
    return Observable.create(observor => {
      this.http.put(this.baseUrl+"api/dataStore/scorecards/"+scorecard.id, scorecard.data)
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe(item => {
          this.detailed_scorecard[scorecard.id] = scorecard.data;
          observor.next(item);
          observor.complete();
        },error => {
          observor.error("Something went wrong try again");
        })
    });
  }

  remove(scorecard: ScoreCard) {
    return Observable.create(observor => {
      this.http.delete(this.baseUrl+"api/dataStore/scorecards/"+scorecard.id)
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe(item => {
          observor.next(item);
          observor.complete();
          this.scorecards.splice(this.scorecards.indexOf(scorecard.id),1);
          delete this.detailed_scorecard[scorecard.id];
        }, error => {
          observor.error(error);
        });
    });
  }

  addRelatedIndicator(indicator_id, related_indicators){
    this.getRelatedIndicators(indicator_id).subscribe(
      // if it is available update the item in data store
      (data) => {
        this.updateRelatedIndicator(indicator_id, related_indicators).subscribe(
          data => console.info("added"),
          error => console.error(error)
        );
      },
      // if it is not available add new item in datastore
      (error) => {
        this.createRelatedIndicator(indicator_id, related_indicators).subscribe(
          data => console.info("added"),
          error => console.error(error)
        );
      }
    )
  }

  getRelatedIndicators(indicator_id){
    return Observable.create(observor => {
      if(this.related_indicators[indicator_id]){
        observor.next(this.related_indicators[indicator_id]);
        observor.complete();
      }else{
        this.http.get(`${this.baseUrl}api/dataStore/scorecardRelatedIndicators/${indicator_id}`)
          .map((response: Response) => response.json())
          .catch(this.handleError)
          .subscribe(indicators => {
            this.related_indicators[indicator_id] = indicators;
            observor.next(this.related_indicators[indicator_id]);
            observor.complete();
          },error=>{
            observor.error("Something went wrong when fetching related indicators");
          })
      }
    });
  }

  createRelatedIndicator(indicator_id, related_indicators) {
    return Observable.create(observor => {
      this.http.post(this.baseUrl+"api/dataStore/scorecardRelatedIndicators/"+indicator_id, related_indicators)
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe((indicator) => {
          this.related_indicators[indicator_id] = related_indicators;
          observor.next(indicator);
          observor.complete();
        },error => {
          observor.error("Something went wrong when created related indicator");
        })
    });
  }

  updateRelatedIndicator(indicator_id, related_indicators) {
    return Observable.create(observor => {
      this.http.put(this.baseUrl+"api/dataStore/scorecardRelatedIndicators/"+indicator_id, related_indicators)
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe(indicator=>{
          this.related_indicators[indicator_id]  = related_indicators;
          observor.next(indicator);
          observor.complete();
        },error => {
          observor.error("Something went wrong when updating related indicators");
        });
    });
  }
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  // generate a random list of Id for use as scorecard id
  makeid(): string{
    let text = "";
    let possible_combinations = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 11; i++ )
      text += possible_combinations.charAt(Math.floor(Math.random() * possible_combinations.length));
    return text;
  }

  // Define default scorecard sample
  getEmptyScoreCard():ScoreCard{
    return {
      id: this.makeid(),
      name: "",
      data: {
        "orgunit_settings": {
          selection_mode: "Usr_orgUnit",
          selected_level: "",
          selected_group: "",
          orgunit_levels: [],
          orgunit_groups: [],
          selected_orgunits: [],
          user_orgunits: [],
          type: "report",
          selected_user_orgunit: "USER_ORGUNIT"
        },
        "average_selection":"all",
        "shown_records":"all",
        "show_average_in_row":false,
        "show_average_in_column":false,
        "periodType": "Quarterly",
        "selected_periods":[],
        "show_data_in_column":false,
        "show_score": false,
        "show_rank": false,
        "rank_position_last": true,
        "header": {
          "title": "",
          "sub_title":"",
          "description": "",
          "show_arrows_definition": true,
          "show_legend_definition": false,
          "template": {
            "display": false,
            "content": ""
          }
        },
        "legendset_definitions": [
          {
            "color": "#008000",
            "definition": "Target achieved / on track"
          },
          {
            "color": "#FFFF00",
            "definition": "Progress, but more effort required"
          },
          {
            "color": "#FF0000",
            "definition": "Not on track"
          },
          {
            "color": "#D3D3D3",
            "definition": "N/A",
            "default": true
          },
          {
            "color": "#FFFFFF",
            "definition": "No data",
            "default": true
          }
        ],
        "highlighted_indicators": {
          "display": false,
          "definitions": []
        },
        "data_settings": {
          "indicator_holders": [],
          "indicator_holder_groups": []
        },
        "additional_labels": [],
        "footer": {
          "display_generated_date": false,
          "display_title": false,
          "sub_title": null,
          "description": null,
          "template": null
        },
        "indicator_dataElement_reporting_rate_selection": "Indicators"
      }
    }
  }

  // define a default indicator structure
  getIndicatorStructure(name:string, id:string, legendset:any = null, tittle:string = null): any{
    if(tittle == null){
      tittle = name;
    }
    return {
      "name": name,
      "id": id,
      "title": tittle,
      "high_is_good": true,
      "value": 0,
      "weight": 100,
      "legend_display": true,
      "legendset":legendset,
      "additional_label_values": {},
      "bottleneck_indicators": [],
      "arrow_settings": {
        "effective_gap": 5,
        "display": true
      },
      "label_settings": {
        "display": true,
        "font_size": ""
      }
    }

  }


}
