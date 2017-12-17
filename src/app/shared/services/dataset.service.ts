import { Injectable } from '@angular/core';
import {HttpClientService} from './http-client.service';

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
  loadAll() {
    return this.http.get(`dataSets.json?fields=id,name,periodType&paging=false`);
  }


}
