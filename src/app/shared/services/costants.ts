import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
/**
 * Created by kelvin on 9/19/16.
 */
@Injectable()
export class Constants {
  root_dir: string = null;
  root_api: string = '../../../api/25/';

  constructor(private http: Http) {
    this.root_dir = '../../../';
    this.loadVersion().subscribe((system_info: any) => {
      if (system_info.version >= 2.25) {
        this.root_api = '../../../api/25/';
      } else {
        this.root_api = '../../../api/';
      }
    });

  }

  load() {
    return this.http.get('manifest.webapp')
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  // load system version
  loadVersion() {
    return this.http.get('../../../api/system/info.json')
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
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
