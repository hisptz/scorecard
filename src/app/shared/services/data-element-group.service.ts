import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';
import {map} from 'rxjs/operators';

export interface DataElementGroup {
  id: string;
  name: string;
  dataElements: any;
}
@Injectable()
export class DataElementGroupService {

  _dataElementGroups: DataElementGroup[];
  constructor(private http: HttpClientService) { }

  // get all data element group
  loadAll(): Observable<any> {
    return this.http.get(`dataElementGroups.json?fields=id,name,dataElements~rename(indicators)[id,name,dataSetElements[dataSet[periodType]]]&paging=false`)
      .pipe( map( (result: any) => result.dataElementGroups));
  }

  // load a single data element group
  load(id: string ): Observable<any> {
    return this.http.get(`dataElementGroups/${id}.json?fields=id,name,dataElements[id,name]`);
  }

  // load a single data element group detailed
  load_detailed(id: string ) {
    return this.http.get(`dataElementGroups/${id}.json?fields=id,name,dataElements[id,name,dataSetElements[dataSet[periodType]]]`);
  }

}
