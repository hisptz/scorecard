import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

export interface ProgramIndicatorGroups {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class ProgramIndicatorsService {

  private _indicatorGroups: ProgramIndicatorGroups[];
  private baseUrl: string;

  constructor(private http: Http) {}

  // get all indicator groups
  loadAll() {
    return this.http.get('../../../api/programs.json?fields=id,name&paging=false')
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  load(id: string ) {
    return this.http.get(`../../../api/programs.json?filter=id:eq:${id}&fields=programIndicators[id,name]&paging=false`)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  private handleError (error: Response | any) {
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
