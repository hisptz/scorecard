import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
/**
 * Created by kelvin on 9/19/16.
 */
@Injectable()
export class Constants {
  root_dir: string = null;
  root_api: string = '../../../api/25/';

  constructor(private http: HttpClient) {
    this.root_dir = '../../../';
    this.loadVersion().subscribe((system_info: any) => {
      if (system_info.version >= 2.25) {
        this.root_api = '../../../api/25';
      } else {
        this.root_api = '../../../api/';
      }
    });

  }

  load() {
    return this.http.get('manifest.webapp');
  }

  // load system version
  loadVersion() {
    return this.http.get('../../../api/system/info.json');
  }

}
