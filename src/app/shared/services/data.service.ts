import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClientService } from './http-client.service';
import { ApplicationState } from '../../store/reducers';
import { Store } from '@ngrx/store';
import {
  LoadUserGroupsDone, LoadUserGroupsFail, LoadUsersDone,
  LoadUsersFail
} from '../../store/actions/static-data.actions';

@Injectable()
export class DataService {

  user: any = null;
  user_groups: any[] = [];
  constructor(
    private http: HttpClientService,
    private store: Store<ApplicationState>
  ) { }

  // Get current user information
  getUserInformation (): Observable<any> {
    return new Observable((observ) => {
      if ( this.user === null) {
        this.http.get('me.json?fields=id,name,userGroups,userCredentials[userRoles[authorities]],dataViewOrganisationUnits[id,name,level],organisationUnits[id,name,level]')
          .subscribe(
          (data) => {
            this.user = data;
            this.store.dispatch(new LoadUsersDone(this.user));
            observ.next(data);
            observ.complete();
          }, error => {
              this.store.dispatch(new LoadUsersFail(error));
            observ.error();
          }
        );
      }else {
        observ.next(this.user);
        observ.complete();
      }
    });
  }

  getUser() {
    this.getUserInformation().subscribe();
  }

  // Get current user information
  getUserGroupInformation (): Observable<any> {
    return Observable.create( (observ) => {
      if ( this.user_groups.length === 0) {
        this.http.get('userGroups.json?fields=id,name&paging=false')
          .subscribe(
          (data) => {
            this.user_groups = [...this.user_groups, {
              id: 'all',
              name: 'Public',
              title: 'This will be accessible to everyone in the system accessing the scorecard'
            }];
            this.user_groups = [...this.user_groups, ...data.userGroups];
            this.store.dispatch(new LoadUserGroupsDone(this.user_groups));
            observ.next(data);
            observ.complete();
          }, error => {
            this.store.dispatch(new LoadUserGroupsFail(error));
            observ.error();
          }
        );
      }else {
        observ.next(this.user);
        observ.complete();
      }
    });
  }

  getUserGroups() {
    this.getUserGroupInformation().subscribe();
  }


  // sorting an array of object
  sortArrOfObjectsByParam (arrToSort: Array<any>, strObjParamToSortBy: string, sortAscending: boolean = true) {
    if ( sortAscending === undefined ) {sortAscending = true; } // default to true
    // if( arrToSort ){
      if ( sortAscending ) {
        arrToSort.sort( function ( a, b ) {
          if ( a[strObjParamToSortBy] > b[strObjParamToSortBy] ) {
            return 1;
          }else {
            return -1;
          }
        });
      }else {
        arrToSort.sort(function (a, b) {
          if ( a[strObjParamToSortBy] < b[strObjParamToSortBy] ) {
            return 1;
          }else {
            return -1;
          }
        });
      }
  }

  getIndicatorsRequest ( orgunits: string, period: string, indicator: string ) {
    return this.http.get('analytics.json?dimension=dx:' + indicator + '&dimension=ou:' + orgunits + '&dimension=pe:' + period + '&displayProperty=NAME');
  }

  getIndicatorData ( orgunitId , period, indicatorsObject) {
    let return_object: 0;
    for ( const row of indicatorsObject.rows ) {
      if ( row[1] === orgunitId && row[2] === period ) {
        return_object =  row[3];
      }
    }
    return return_object;
  }

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }

}
