import { Injectable } from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable, Subscription} from "rxjs";
/**
 * Created by kelvin on 9/19/16.
 */
@Injectable()
export class Constants {
    root_dir: string = null;
    root_api: string = null;

    constructor( private http: Http ){
      this.root_dir = '../../../';
      this.root_api = '../../../api/25/';
    }

  load() {
    return this.http.get("manifest.webapp")
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
