import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';

export interface ProgramIndicatorGroups {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class ProgramIndicatorsService {

  private _indicatorGroups: ProgramIndicatorGroups[];
  private baseUrl: string;

  constructor(private http: HttpClientService) {}

  // get all indicator groups
  loadAll(): Observable<any> {
    return this.http.get('programs.json?fields=id,name&paging=false');
  }

  load(id: string ): Observable<any> {
    return this.http.get(`programs.json?filter=id:eq:${id}&fields=programIndicators[id,name]&paging=false`);
  }


}
