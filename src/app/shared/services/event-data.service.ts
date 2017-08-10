import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

export interface EventData {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class EventDataService {

  private _indicatorGroups: EventData[];

  constructor(private http: Http) {  }

  // get all indicator groups
  loadAll() {
    return this.http.get('../../../api/programs.json?fields=id,name&paging=false')
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  load(id: string ) {
    return this.http.get('../../../api/programDataElements.json?program=${id}&fields=dimensionItem%7Crename(id),name,valueType&paging=false')
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
