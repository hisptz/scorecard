import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';
import {map} from 'rxjs/operators';

export interface ProgramIndicatorGroups {
  id: string;
  name: string;
  programIndicators: any;
}

@Injectable()
export class ProgramIndicatorsService {

  private _indicatorGroups: ProgramIndicatorGroups[];
  private baseUrl: string;

  constructor(private http: HttpClientService) {}

  // get all indicator groups
  loadAll(): Observable<any> {
    return this.http.get('programs.json?fields=id,name,programIndicators[id,name]&paging=false').pipe(
      map((response: any) => response.programs)
    );
  }

  load(id: string ): Observable<any> {
    return this.http.get(`programs.json?filter=id:eq:${id}&fields=programIndicators[id,name]&paging=false`);
  }


}
