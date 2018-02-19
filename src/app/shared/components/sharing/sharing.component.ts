import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as _ from 'lodash';
import {animate, group, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-sharing',
  templateUrl: './sharing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sharing.component.css'],
  animations: [
    trigger('fadeOut', [
      state('void', style({opacity: 0})),
      transition(':enter', animate('200ms')),
      transition(':leave', animate('200ms'))
    ]),
    trigger('showOption', [
      state('hidden', style(
        {'opacity': 0.1, 'transform': 'translateY(-50px)', 'max-height': '50px', 'display': 'none'}
      )),
      state('shown', style(
        {opacity: 1, transform: 'translateY(0)'}
      )),
      transition('hidden => shown', [
        group([
          animate('300ms', style({transform: 'translateY(0)'})),
          animate('400ms', style({opacity: 1})),
          animate('300ms', style({'max-height': '360px'}))
        ])
      ]),
      transition('shown => hidden', [
        group([
          animate('300ms', style({transform: 'translateY(0)', opacity: 1})),
          animate('400ms', style({'display': 'none'})),
          animate('350ms', style({'max-height': '30px'}))
        ])
      ])
    ])
  ]
})
export class SharingComponent implements OnInit {

  @Input() user_groups: any;
  @Input() userGroups: any;
  @Input() group_loading: boolean;
  @Output() onGroupChange = new EventEmitter();

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
  toogleGroup(type, group, event) {
    if (group.hasOwnProperty(type)) {
      group = {...group, [type]: !group[type]};
    }else {
      group =  {...group, [type]: true};
    }
    const groupIndex = _.findIndex(this.userGroups , {'id': group.id});
    if (!_.find(this.user_groups, {'id': group.id})) {
      this.user_groups = [...this.user_groups, group];
    }else {
      this.user_groups.forEach((value, index) => {
        if ( value.id === group.id ) {
          this.user_groups =
            [
              ...this.user_groups.slice(0, index),
              group,
              ...this.user_groups.slice(index + 1)
            ];
        }
      });
    }
    if (!group['see'] && !group['edit']) {
      this.user_groups.forEach((value, index) => {
        if ( value.id === group.id ) {
          this.user_groups = [...this.user_groups.slice(0, index), ...this.user_groups.slice(index + 1)];
        }
      });
    }
    this.userGroups = [
      ...this.userGroups.slice(0, groupIndex),
      group,
      ...this.userGroups.slice(groupIndex + 1)
    ];
    this.onGroupChange.emit(this.user_groups);
    event.stopPropagation();

  }

  getGroupActiveState(type, group): boolean {
    let checker = false;
    this.user_groups.forEach((value) => {
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
