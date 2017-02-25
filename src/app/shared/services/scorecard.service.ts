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

  _scorecards: ScoreCard[];
  private baseUrl: string;

  constructor(private http: Http, private costant: Constants) {
    this.baseUrl = this.costant.root_dir;
  }

  loadAll() {
    return this.http.get(this.baseUrl+"api/dataStore/scorecards")
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  load(id: string ) {
    return this.http.get(`${this.baseUrl}api/dataStore/scorecards/${id}`)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  create(scorecard: ScoreCard) {
    return this.http.post(this.baseUrl+"api/dataStore/scorecards/"+scorecard.id, scorecard.data)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  update(scorecard: ScoreCard) {
    console.log(JSON.stringify(scorecard));
    return this.http.put(this.baseUrl+"api/dataStore/scorecards/"+scorecard.id, scorecard.data)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  remove(scorecard: ScoreCard) {
    return this.http.delete(this.baseUrl+"api/dataStore/scorecards/"+scorecard.id)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  addRelatedIndicator(indicator_id, related_indicators){
    this.getRelatedIndicators(indicator_id).subscribe(
      // if it is available update the item in data store
      (data) => {
        this.updateRelatedIndicator(indicator_id, related_indicators).subscribe(
          data => console.log("added"),
          error => console.log("something went wrong")
        );
      },
      // if it is not available add new item in datastore
      (error) => {
        this.createRelatedIndicator(indicator_id, related_indicators).subscribe(
          data => console.log("added"),
          error => console.log("something went wrong")
        );
      }
    )
  }

  getRelatedIndicators(indicator_id){
    return this.http.get(`${this.baseUrl}api/dataStore/scorecardRelatedIndicators/${indicator_id}`)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  createRelatedIndicator(indicator_id, related_indicators) {
    return this.http.post(this.baseUrl+"api/dataStore/scorecardRelatedIndicators/"+indicator_id, related_indicators)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  updateRelatedIndicator(indicator_id, related_indicators) {
    return this.http.put(this.baseUrl+"api/dataStore/scorecardRelatedIndicators/"+indicator_id, related_indicators)
      .map((response: Response) => response.json())
      .catch(this.handleError);
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

}
