import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DataService {

  user: any = null;
  constructor(private http: Http) { }

  // Get current user information
  getUserInformation (): Observable<any> {
    return new Observable((observ) => {
      if ( this.user === null) {
        this.http.get('../../../api/me.json?fields=id,name,userGroups,userCredentials[userRoles[authorities]]')
          .map((response: Response) => response.json())
          .catch( this.handleError ).subscribe(
          (data) => {
            this.user = data;
            observ.next(data);
            observ.complete();
          }, error => {
            observ.error();
          }
        );
      }else {
        observ.next(this.user);
        observ.complete();
      }
    });
  }

  /**
   *
   * @param scorecard_groups
   * @param user_groups
   * @returns {{see: boolean, edit: boolean}}
   */
  checkForUserGroupInScorecard(scorecard, user): any {
    let checker_see: boolean = false;
    let checker_edit: boolean = false;
    if (scorecard.hasOwnProperty('user')) {
      if (user.id === scorecard.user.id ) {
        checker_see = true;
        checker_edit = true;
      }
    }else {
      checker_see = true;
      checker_edit = true;
    }
    if (scorecard.hasOwnProperty('user_groups')) {
      for ( const group of scorecard.user_groups){
        if ( group.id === 'all' ) {
          if (group.see) {
            checker_see = true;
          }
          if (group.edit) {
            checker_see = true;
            checker_edit = true;
          }
        }
        for ( const user_group of user.userGroups){
          if ( user_group.id === group.id ) {
            if (group.see) {
              checker_see = true;
            }
            if (group.edit) {
              checker_see = true;
              checker_edit = true;
            }
          }
        }
      }
    }
    return { see: checker_see, edit: checker_edit };
  }

  // Get current user information
  getUserGroupInformation () {
    return this.http.get('../../../api/userGroups.json?fields=id,name&paging=false')
      .map((response: Response) => response.json())
      .catch( this.handleError );
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
    // }

  }

  getIndicatorsRequest ( orgunits: string, period: string, indicator: string ) {
    return this.http.get('../../../analytics.json?dimension=dx:' + indicator + '&dimension=ou:' + orgunits + '&dimension=pe:' + period + '&displayProperty=NAME')
      .map((response: Response) => response.json())
      .catch( this.handleError );
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
