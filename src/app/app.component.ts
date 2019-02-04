import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor (private translate: TranslateService, private http: HttpClient) {
    http.get('manifest.webapp').subscribe((data: any) => {
      translate.setDefaultLang('en');
      if (data.hasOwnProperty('language')) {
        translate.setDefaultLang(data.language);
      }else {
        translate.setDefaultLang('en');
      }
    });
  }


}
