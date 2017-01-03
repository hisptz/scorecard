import { Injectable } from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable, Subscription} from "rxjs";
/**
 * Created by kelvin on 9/19/16.
 */
@Injectable()
export class Constants {
    root_dir: string = null;
    private subscription: Subscription;
    current_orgunit: any = null;
    current_period: any = null;
    current_period_name  : any = null;

    constructor( private http: Http ){
      this.root_dir = '../../../';
        // this.subscription = this.load().subscribe(
        //   (data) => {
        //     //noinspection TypeScriptUnresolvedVariable
        //     this.root_dir = data.activities.dhis.href ;
        //   }
        // );

      // this.root_dir = 'http://127.0.0.1:9000/';
      // this.root_dir = 'http://41.217.202.50:9002/dhis/'
      // this.root_dir = 'https://dhis.moh.go.tz/'
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
