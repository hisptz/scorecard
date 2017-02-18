import {Component, OnInit, AfterViewInit, ElementRef, Input} from '@angular/core';
import { Http, Response } from '@angular/http';
import {Observable} from 'rxjs';

import 'rxjs/Rx';

@Component({
  selector: 'dhis-menu',
  templateUrl: './dhis-menu.component.html'
})
export class DhisMenuComponent implements OnInit, AfterViewInit {
    // dhis_2 url
    @Input() dhis2_url: string;
    // holder for the application title
   application_title: string;
   show_menu: boolean = false

  // holder for the starting module
  start_module: string;
  application_style: string;
  constructor( private elementRef: ElementRef,  private http: Http ) {

  }

  ngOnInit() {
    window['dhis2'] = window['dhis2']|| {};
    window['dhis2'].settings = window['dhis2'].settings || {};
    this.loadBaseUrl().subscribe(
      ( data ) => {

        //noinspection TypeScriptUnresolvedVariable
        window['dhis2'].settings.baseUrl = data.activities.dhis.href;
        setTimeout(() => {
          // adding nessesary script tags for the menu
          const k = document.createElement('script');
          k.type = 'text/javascript';
          k.src = this.dhis2_url + 'dhis-web-commons/javascripts/dhis2/dhis2.translate.js';
          this.elementRef.nativeElement.appendChild(k);
          const j = document.createElement('script');
          j.type = 'text/javascript';
          j.src = this.dhis2_url + 'dhis-web-commons/javascripts/dhis2/dhis2.menu.js';
          this.elementRef.nativeElement.appendChild(j);
          const g = document.createElement('script');
          g.type = 'text/javascript';
          g.src = this.dhis2_url + 'dhis-web-commons/javascripts/dhis2/dhis2.menu.ui.js';
          this.elementRef.nativeElement.appendChild(g);
        }, 100);
      }
    )
  }

  /**
   * This function helps to solve the parse error to redirect to main page
   */
  redirecAction () {
    window.location.href = this.dhis2_url + this.start_module + '/index.action';
  }

  ngAfterViewInit() {

    this.getSystemSettings()
      .subscribe(
        (data: any) => {
          this.start_module = data.startModule;
          this.application_title = data.applicationTitle;
          this.application_style = ('currentStyle' in data) ? data.currentStyle : data.keyStyle;

          // Adding font awesome for Menu Icons
          const font_awesome = document.createElement('link');
          font_awesome.setAttribute('rel', 'stylesheet');
          font_awesome.setAttribute('type', 'text/css');
          font_awesome.setAttribute('href', this.dhis2_url + 'dhis-web-commons/font-awesome/css/font-awesome.min.css' );
          document.getElementsByTagName('head')[0].appendChild(font_awesome);

          // Adding bootstrap_css file for Menu Icons
          const bootstrap_css = document.createElement('link');
          bootstrap_css.setAttribute('rel', 'stylesheet');
          bootstrap_css.setAttribute('type', 'text/css');
          bootstrap_css.setAttribute('href', this.dhis2_url + 'dhis-web-commons/bootstrap/css/bootstrap.min.css' );
          document.getElementsByTagName('head')[0].appendChild(bootstrap_css);

          this.getUserSettings()
            .subscribe(
              (userData: any) => {
                this.application_style = ('keyStyle' in userData) ? userData.keyStyle : this.application_style;
                // adding color dhis css to match the selected styles
                const element = document.createElement('link');
                element.setAttribute('rel', 'stylesheet');
                element.setAttribute('type', 'text/css');
                element.setAttribute('href', this.dhis2_url + 'dhis-web-commons/css/' + this.application_style );
                document.getElementsByTagName('head')[0].appendChild(element);
                this.show_menu = true
              },
              error => {
                const element = document.createElement('link');
                element.setAttribute('rel', 'stylesheet');
                element.setAttribute('type', 'text/css');
                element.setAttribute('href', this.dhis2_url + 'dhis-web-commons/css/' + this.application_style );
                document.getElementsByTagName('head')[0].appendChild(element);
                this.show_menu = true
              }
            );
        },
        error => {
          console.log("did not get some data");
        }
      );

  }

    // Get system wide settings
    getSystemSettings () {
        return this.http.get(this.dhis2_url + 'api/systemSettings.json')
            .map((response: Response) => response.json())
            .catch( this.handleError );
    }

    // Get User Specific Settings
    getUserSettings () {
        return this.http.get(this.dhis2_url + 'api/userSettings.json')
            .map((response: Response) => response.json())
            .catch( this.handleError );
    }

  loadBaseUrl() {
    return this.http.get("manifest.webapp")
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }
    // Handling error
    handleError (error: any) {
        return Observable.throw( error );
    }


}
