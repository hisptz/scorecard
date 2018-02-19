import { Injectable } from '@angular/core';
import {HttpClientService} from './http-client.service';

export interface EventData {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class EventDataService {

  constructor(private http: HttpClientService) {  }

  // get all indicator groups
  loadAll() {
    return this.http.get('programs.json?fields=id,name&paging=false');
  }

  load(id: string ) {
    return this.http.get('programDataElements.json?program=${id}&fields=dimensionItem%7Crename(id),name,valueType&paging=false');
  }

}
