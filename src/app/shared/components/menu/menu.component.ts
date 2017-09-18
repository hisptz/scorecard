import {Component, OnInit, Input} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Http, Response} from '@angular/http';
import {PROFILE_MENUS} from './profile-menus';
import {menuBackgroundColors} from './background-colors';
import {MenuService} from './menu.service';

@Component({
  selector: 'dhis-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input() rootUrl: string;
  backgroundColor: string;
  applicationTitle: string;
  currentUser: any;
  searchWidth: number;
  showApps: boolean;
  showProfile: boolean;
  apps: any[];
  originalApps: any[];
  profileMenus: any[];
  filteredApp: string;
  loadingModules: boolean;
  loadingUser: boolean;
  showSidebarApps: boolean;
  showSidebar: boolean;

  constructor(private http: Http, private menuService: MenuService) {
    this.rootUrl = '../../../';
    this.backgroundColor = '#f5f5f5';
    this.searchWidth = 30;
    this.currentUser = {};
    this.showApps = false;
    this.showProfile = false;
    this.profileMenus = PROFILE_MENUS;
    this.filteredApp = '';
    this.loadingModules = true;
    this.loadingUser = true;
    this.apps = [];
    this.originalApps = [];
    this.showSidebarApps = false;
    this.showSidebar = false;
  }

  ngOnInit() {
    this.menuService.getSystemSettings(this.rootUrl)
      .subscribe((settings: any) => {
        if (settings !== null) {
          this.applicationTitle = settings['applicationTitle'];
          /**
           * get system current background style
           * @type {string}
           */
          const colorName = settings.hasOwnProperty('currentStyle') ?
            settings['currentStyle'].split('/')[0] : settings.hasOwnProperty('keyStyle') ? settings['keyStyle'].split('/')[0] : 'blue';
          this.backgroundColor = menuBackgroundColors[colorName];
        }
      });

    this.menuService.getUserInfo(this.rootUrl)
      .subscribe((profile: any) => {
        if (profile !== null) {
          this.loadingUser = false;
          this.currentUser.name = profile.displayName;
          this.currentUser.email = profile.email;
          this.currentUser.AbbreviatedName = this.getAbbreviatedName(profile.displayName);
        }
      });

    this.menuService.getMenuModules(this.rootUrl)
      .subscribe((menuModules: any) => {
        if (menuModules !== null) {
          this.loadingModules = false;
          this.originalApps = [...menuModules];
          this.apps = this._prepareMenuModules();
        }
      });
  }

  private _prepareMenuModules() {
    return this.filteredApp === '' ? this.originalApps.filter((menu: any) => {
      return  !menu.onlyShowOnSearch;
    }) : this.originalApps;
  }

  updateMenuModules() {
    this.apps = this._prepareMenuModules();
  }

  private getAbbreviatedName(name): string {
    const abbreviatedName: any[] = [];
    let count = 0;
    for (let i = 0; i <= name.length - 1; i++) {
      if (i === 0) {
        abbreviatedName.push(name[i].toUpperCase());
      } else {
        if (name[i] === ' ') {
          count = i;
          abbreviatedName.push(name[count + 1].toUpperCase());
        }
      }
    }

    return abbreviatedName.join('');
  }

  widdenSearch(e) {
    e.stopPropagation();
    this.searchWidth = 67;
    this.showApps = !this.showApps;
  }

  reduceSearch(e) {
    e.stopPropagation();
    document.getElementById('menu-search-input').blur();
    this.searchWidth = 30;
    this.showApps = !this.showApps;
  }

  toggleSidebarMenus(e) {
    e.stopPropagation();
    this.showSidebarApps = !this.showSidebarApps;
  }

  toggleSideBar(e) {
    e.stopPropagation();
    this.showSidebar = !this.showSidebar;
  }

}


