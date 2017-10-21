import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {PREDEFINED_MENU_ITEMS} from './predifined-menu-items';

@Injectable()
export class MenuService {

  constructor(private http: Http) {
  }

  getSystemSettings(rootUrl: string): Observable<any> {
    return Observable.create(observer => {
      this.http.get(rootUrl + 'api/systemSettings.json')
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe((settings: any) => {
          observer.next(settings);
          observer.complete();
        }, () => {
          observer.next(null);
          observer.complete();
        });
    });
  }

  getUserInfo(rootUrl: string): Observable<any> {
    return Observable.create(observer => {
      this.http.get(rootUrl + 'api/me.json')
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe((userInfo: any) => {
          observer.next(userInfo);
          observer.complete();
        }, () => {
          observer.next(null);
          observer.complete();
        });
    });
  }

  getMenuModules(rootUrl: string): Observable<any> {
    return Observable.create(observer => {
      this.http.get(rootUrl + 'dhis-web-commons/menu/getModules.action')
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe((menuModuleResult: any) => {
          observer.next(this._sanitizeMenuItems(menuModuleResult.modules, rootUrl));
          observer.complete();
        }, () => {
          observer.next(null);
          observer.complete();
        });
    });
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      errMsg = error.toString();
    } else {
      const newErrorObject: any = Object.assign({}, error);
      let sanitizedError = newErrorObject.message ?
        newErrorObject.message : newErrorObject._body ? newErrorObject._body : newErrorObject.toString();
      try {
        sanitizedError = (new Function('return ' + sanitizedError))();
        errMsg = sanitizedError.message;
      } catch (e) {
        errMsg = sanitizedError;
      }
    }
    return Observable.throw(errMsg);
  }

  private _sanitizeMenuItems(menuItems: any[], rootUrl: string): any {
    const sanitizedMenuItems = menuItems.map((item: any) => {
      const newItem: any = {...item};
      if (!newItem.hasOwnProperty('displayName') || newItem.displayName === '') {
        newItem.displayName = newItem.name;
      }

      if (newItem.defaultAction.indexOf('http') === -1) {
        newItem.defaultAction = '../../' + newItem.defaultAction;
      }

      if (newItem.icon.indexOf('http') === -1) {
        newItem.icon = '../../' + newItem.icon;
      }

      newItem.onlyShowOnSearch = false;

      return newItem;
    });

    const predefinedMenuItems = PREDEFINED_MENU_ITEMS.map((item: any) => {
      const newItem: any = {...item};

      if (newItem.defaultAction) {
        newItem.defaultAction = rootUrl + newItem.defaultAction;
      }

      if (newItem.icon) {
        newItem.icon = rootUrl + newItem.icon;
      }
      return newItem;
    });
    return [...sanitizedMenuItems, ...predefinedMenuItems];
  }


}
