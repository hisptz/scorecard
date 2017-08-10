import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Response} from '@angular/http';

export interface Dataset {
  id: string;
  name: string;
  periodType: string;
}

@Injectable()
export class DatasetService {

  _datasets: Dataset[];
  constructor(private http: Http) { }

  // get all data element group
  loadAll() {
    return this.http.get(`../../../api/dataSets.json?fields=id,name,periodType&paging=false`)
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
