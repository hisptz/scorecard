import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';

export interface IndicatorGroup {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class IndicatorGroupService {

  private _indicatorGroups: any = null;
  private baseUrl: string;

  constructor(private http: HttpClientService ) { }

  // get all indicator groups
  loadAll(): Observable<any> {
    return Observable.create(observer => {
      if ( this._indicatorGroups ) {
        observer.next(this._indicatorGroups);
        observer.complete();
      }else {
        this.http.get('indicatorGroups.json?fields=id,name,indicators[id,name]&paging=false')
          .subscribe((groups: any) => {
              this._indicatorGroups = groups;
              observer.next(this._indicatorGroups);
              observer.complete();
            },
            error => {
              observer.error('some error occur');
            });
      }
    });
  }

  load(id: string ): Observable<any> {
    return this.http.get(`indicatorGroups/${id}.json?fields=id,name,indicators[id,name,indicatorType[id,name]]`);
  }

}
