import { Injectable } from '@angular/core';

import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import {Constants} from "../costants";

@Injectable()
export class FilterService {

  constructor(private http: Http, private constant: Constants) { }

  // Get available organisation units levels information
  getOrgunitLevelsInformation () {
    return this.http.get(this.constant.root_dir + 'api/organisationUnitLevels.json?fields=id')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Get orgunits and children
  getOrgunitDetails (orgunit) {
    return this.http.get(this.constant.root_dir + 'api/organisationUnits/'+orgunit+'.json?fields=id,name,level,children[id,name,level]')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Get starting organisation Unit
  getInitialOrgunitsForTree (uid:string = null) {
    if( uid == null ){
      return this.http.get(this.constant.root_dir + 'api/organisationUnits.json?filter=level:eq:1&paging=false&fields=id,name,level,children[id,name,level]')
        .map((response: Response) => response.json())
        .catch( this.handleError );
    }else{
      return this.http.get(this.constant.root_dir + 'api/organisationUnits/'+uid+'.json?fields=id,name,level')
        .map((response: Response) => response.json())
        .catch( this.handleError );
    }
  }

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }
}
