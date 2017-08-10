import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Response} from '@angular/http';

export interface DataElementGroup {
  id: string;
  name: string;
  dataElements: any;
}
@Injectable()
export class DataElementGroupService {

  _dataElementGroups: DataElementGroup[];
  constructor(private http: Http) { }

  // get all data element group
  loadAll() {
    return this.http.get(`../../../api/dataElementGroups.json?fields=id,name&paging=false`)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  // load a single data element group
  load(id: string ) {
    return this.http.get(`../../../api/dataElementGroups/${id}.json?fields=id,name,dataElements[id,name]`)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  // load a single data element group detailed
  load_detailed(id: string ) {
    return this.http.get(`../../../api/dataElementGroups/${id}.json?fields=id,name,dataElements[id,name,dataSetElements[dataSet[periodType]]]`)
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
