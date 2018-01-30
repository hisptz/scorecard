import { Injectable } from '@angular/core';
import {HttpClientService} from './http-client.service';
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators";

export interface Dataset {
  id: string;
  name: string;
  periodType: string;
}

@Injectable()
export class DatasetService {

  _datasets: Dataset[];
  constructor(private http: HttpClientService) { }

  // get all data element group
  loadAll(): Observable<Dataset[]> {
    return this.http.get(`dataSets.json?fields=id,name,periodType&paging=false`).pipe(
      map( (result: any) => result.dataSets)
    );
  }


}
