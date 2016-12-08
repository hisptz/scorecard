import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Http, Response} from "@angular/http";
import {Constants} from "../costants";

export interface IndicatorGroup {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class IndicatorGroupService {

  private _indicatorGroups: IndicatorGroup[];
  private baseUrl: string;

  constructor(private http: Http, private costant: Constants) {
    this.baseUrl = this.costant.root_dir;
  }

  // get all indicator groups
  loadAll() {
    return this.http.get(this.baseUrl+"api/indicatorGroups.json?fields=id,name&paging=false")
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  load(id: string ) {
    return this.http.get(`${this.baseUrl}api/indicatorGroups/${id}.json?fields=id,name,indicators[id,name,indicatorType[id,name]]`)
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
