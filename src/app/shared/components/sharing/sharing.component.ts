import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.css']
})
export class SharingComponent implements OnInit {

  @Input() scorecard: any;
  @Input() userGroups: any;
  @Input() group_loading: boolean;

  showShareTree: boolean = true;
  share_filter: string = '';
  constructor() { }

  ngOnInit() {

  }

  //  display sharing Tree
  displayShareTree() {
    this.showShareTree = !this.showShareTree;
  }

  //  add user sharing settings
  toogleGroup(type, group) {
    if (group.hasOwnProperty(type)) {
      group[type] = !group[type];
    }else {
      group[type] = true;
    }
    if (!this.checkItemAvailabilty(group, this.scorecard.data.user_groups)) {
      this.scorecard.data.user_groups.push(group);
    }else {
      this.scorecard.data.user_groups.forEach((value, index) => {
        if ( value.id === group.id ) {
          this.scorecard.data.user_groups[index] = group;
        }
      });
    }
    if (!group['see'] && !group['edit']) {
      this.scorecard.data.user_groups.forEach((value, index) => {
        if ( value.id === group.id ) {
          this.scorecard.data.user_groups.splice(index, 1);
        }
      });
    }

  }

  getGroupActiveState(type, group): boolean {
    let checker = false;
    this.scorecard.data.user_groups.forEach((value) => {
      if ( value.id === group.id && value.hasOwnProperty(type)) {
        checker = value[type];
      }
    });
    return checker;
  }

  //  check if orgunit already exist in the orgunit display list
  checkItemAvailabilty(item, array): boolean {
    let checker = false;
    array.forEach((value) => {
      if ( value.id === item.id ) {
        checker = true;
      }
    });
    return checker;
  }

}
