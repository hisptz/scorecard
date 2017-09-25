import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Response} from '@angular/http';

export interface IndicatorGroup {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class IndicatorGroupService {

  private _indicatorGroups: any = null;
  private baseUrl: string;

  constructor(private http: Http ) { }

  // get all indicator groups
  loadAll(): Observable<any> {
    return Observable.create(observer => {
      if ( this._indicatorGroups ) {
        observer.next(this._indicatorGroups);
        observer.complete();
      }else {
        this.http.get('../../../api/indicatorGroups.json?fields=id,name&paging=false')
          .map((response: Response) => response.json())
          .catch( this.handleError )
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
    return this.http.get(`../../../api/indicatorGroups/${id}.json?fields=id,name,indicators[id,name,indicatorType[id,name]]`)
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
