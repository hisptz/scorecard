import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { TreeComponent, TREE_ACTIONS, IActionMapping } from 'angular-tree-component';
import { MultiselectComponent } from './multiselect/multiselect.component';
import { OrgUnitService } from '../../services/org-unit.service';
import * as _ from 'lodash';
import {animate, group, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-org-unit-filter',
  templateUrl: './org-unit-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./org-unit-filter.component.css'],
  animations: [
    trigger('showOption', [
      state('hidden', style(
        {'opacity': 0.1, 'transform': 'translateY(-50px)', 'max-height': '50px', 'display': 'none'}
      )),
      state('shown', style(
        {opacity: 1, transform: 'translateY(0)'}
      )),
      transition('hidden => shown', [
        group([
          animate('150ms', style({transform: 'translateY(0)'})),
          animate('200ms', style({opacity: 1})),
          animate('150ms', style({'max-height': '360px'}))
        ])
      ]),
      transition('shown => hidden', [
        group([
          animate('50ms', style({transform: 'translateY(0)', opacity: 1})),
          animate('20ms', style({'display': 'none'})),
          animate('50ms', style({'max-height': '30px'}))
        ])
      ])
    ])
  ]
})
export class OrgUnitFilterComponent implements OnInit {
  // the object that will carry the output value you can send one from outside to config start values
  @Input() orgunit_model: any =  {
    selection_mode: 'orgUnit',
    selected_levels: [],
    show_update_button: true,
    selected_groups: [],
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    type: 'report', // can be 'data_entry'
    selected_user_orgunit: []
  };
  initial_usr_orgunit = [];
  // The organisation unit configuration object This will have to come from outside.
  @Input() orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: true,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    multiple_key: 'none', // can be control or shift
    placeholder: 'Select Organisation Unit'
  };

  @Input() showUpdate: boolean = false;
  @Input() pickChildren: boolean = true;

  @Output() onOrgUnitUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output() onOrgUnitChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onOrgUnitModelUpdate: EventEmitter<any> = new EventEmitter<any>();

  orgUnit: any = {};
  root_url = '../../../';
  nodes: any[] = null;
  orgunit_levels: any[] = [];
  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('period_selector')
  period_selector: MultiselectComponent;

  organisationunits: any[] = [];
  selected_orgunits: any[] = [];

  // this variable controls the visibility of of the tree
  showOrgTree: boolean = true;

  customTemplateStringOrgunitOptions: any;

  user_orgunits_types: Array<any> = [
    {id: 'USER_ORGUNIT', name: 'User orgunit', shown: true},
    {id: 'USER_ORGUNIT_CHILDREN', name: 'User sub-units', shown: true},
    {id: 'USER_ORGUNIT_GRANDCHILDREN', name: 'User sub-x2-units', shown: true}
  ];
  constructor(
    private orgunitService: OrgUnitService
  ) {
     if (!this.orgunit_tree_config.hasOwnProperty('multiple_key')) {
       this.orgunit_tree_config.multiple_key = 'none';
     }
  }

  updateModelOnSelect(data) {
    if (!this.orgunit_model.show_update_button) {
      this.onOrgUnitUpdate.emit({name: 'ou', value: data.id});
      this.displayOrgTree();
    }
  }
  ngOnInit() {
    if (this.orgunit_tree_config.multiple) {
      if (this.orgunit_tree_config.multiple_key === 'none') {
        const actionMapping: IActionMapping = {
          mouse: {
            dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
            click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
          }
        };
        this.customTemplateStringOrgunitOptions = {actionMapping};

      }else if (this.orgunit_tree_config.multiple_key === 'control') { // multselect using control key
        const actionMapping: IActionMapping = {
          mouse: {
            click: (node, tree, $event) => {
              $event.ctrlKey
                ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
                : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event);
            }
          }
        };
        this.customTemplateStringOrgunitOptions = {actionMapping};
      }else if (this.orgunit_tree_config.multiple_key === 'shift') { // multselect using shift key
        const actionMapping: IActionMapping = {
          mouse: {
            click: (node, tree, $event) => {
              $event.shiftKey
                ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
                : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event);
            }
          }
        };
        this.customTemplateStringOrgunitOptions = {actionMapping};
      }

    }else {
      const actionMapping: IActionMapping = {
        mouse: {
          dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
          click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
        }
      };
      this.customTemplateStringOrgunitOptions = {actionMapping};
    }


    // if (this.orgunitService.nodes === null) {
      this.orgunitService.getOrgunitLevelsInformation()
        .subscribe(
          (data: any) => {
            // assign urgunit levels and groups to variables
            this.orgunit_model = { ...this.orgunit_model, 'orgunit_levels': data.organisationUnitLevels };
            // setting organisation groups
            this.orgunitService.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable
              this.orgunit_model = { ...this.orgunit_model, 'orgunit_groups': groups };
            });

            // identify currently logged in usser
            this.orgunitService.getUserInformation(this.orgunit_model.type).subscribe(
              userOrgunit => {
                const level = this.orgunitService.getUserHighestOrgUnitlevel( userOrgunit );
                this.orgunit_model.user_orgunits = this.orgunitService.getUserOrgUnits( userOrgunit );
                this.orgunitService.user_orgunits = this.orgunitService.getUserOrgUnits( userOrgunit );
                const all_levels = data.pager.total;
                const orgunits = this.orgunitService.getuserOrganisationUnitsWithHighestlevel( level, userOrgunit );
                const use_level = parseInt(all_levels) - (parseInt(level) - 1);
                // load inital orgiunits to speed up loading speed
                this.orgunitService.getInitialOrgunitsForTree(orgunits).subscribe(
                  (initial_data) => {
                    this.organisationunits = initial_data;
                    this.orgunit_tree_config.loading = false;
                    // a hack to make sure the user orgunit is not triggered on the first time
                    this.initial_usr_orgunit = [{id: 'USER_ORGUNIT', name: 'User org unit'}];
                    // after done loading initial organisation units now load all organisation units
                    const fields = this.orgunitService.generateUrlBasedOnLevels(use_level);
                    this.orgunitService.getAllOrgunitsForTree1(fields, orgunits).subscribe(
                      items => {
                        this.organisationunits = this.sortOrganisationUnitTree([
                          {
                            ...items[0],
                            isExpanded: true
                          },
                          ...items.slice(1)
                        ]);

                        // activate organisation units
                        for (const active_orgunit of this.orgunit_model.selected_orgunits) {
                          this.activateNode(active_orgunit.id, this.orgtree, true);
                        }
                        if (this.orgunit_model.selected_user_orgunit.length !== 0) {
                          this.emit(false);
                        }
                        // backup to make sure that always there is default organisation unit
                        if (this.orgunit_model.selected_orgunits.length === 0 && this.orgunit_model.selected_user_orgunit.length === 0) {
                          for (const active_orgunit of this.orgunit_model.user_orgunits) {
                            this.activateNode(active_orgunit.id, this.orgtree, true);
                          }
                        }
                      },
                      error => {
                        console.log('something went wrong while fetching Organisation units');
                        this.orgunit_tree_config.loading = false;
                      }
                    );
                  },
                  error => {
                    console.log('something went wrong while fetching Organisation units');
                    this.orgunit_tree_config.loading = false;
                  }
                );

              }
            );
          }
        );
  }


  updateOrgunits() {
    this.displayOrgTree();
    this.emit(true);
  }

  clearAll() {
    for (const active_orgunit of this.orgunit_model.selected_orgunits) {
      this.deActivateNode(active_orgunit.id, this.orgtree, null);
    }
  }

  setType(type: string) {
    this.orgunit_model.selection_mode = type;
    if ( type !== 'orgUnit' ) {
      this.orgunit_model.selected_user_orgunit = [];
    }
    if ( type !== 'Level' ) {
      this.orgunit_model.selected_levels = [];
    }
    if ( type !== 'Group' ) {
      this.orgunit_model.selected_groups = [];
    }
  }
  // display Orgunit Tree
  displayOrgTree() {
    this.showOrgTree = !this.showOrgTree;
  }
  filterNodes(value, tree) {
    tree.treeModel.filterNodes((node) => {
      return !node.data.name.startsWith(value);
    });
  }

  activateNode(nodeId: any, nodes, first) {
    setTimeout(() => {
      const node = nodes.treeModel.getNodeById(nodeId);
      if (node) {
        node.setIsActive(true, true);
      }
      if (first) {
        node.toggleExpanded();
      }
    }, 0);

  }

  // a method to activate the model
  deActivateNode(nodeId: any, nodes, event) {
    setTimeout(() => {
      const node = nodes.treeModel.getNodeById(nodeId);
      if (node) {
        node.setIsActive(false, true);
      }
    }, 0);
    if ( event !== null) {
      event.stopPropagation();
    }
  }

  // check if orgunit already exist in the orgunit display list
  checkOrgunitAvailabilty(orgunit, array): boolean {
    let checker = false;
    array.forEach((value) => {
      if ( value.id === orgunit.id ) {
        checker = true;
      }
    });
    return checker;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivateOrg ( $event ) {
    this.period_selector.reset();
    if (this.orgunit_model.selection_mode === 'Usr_orgUnit') {
      this.orgunit_model.selection_mode = 'orgUnit';
      this.period_selector.reset();
    }
    this.orgunit_model.selected_orgunits.forEach((item, index) => {
      if ( $event.node.data.id === item.id ) {
        this.orgunit_model.selected_orgunits = [...this.orgunit_model.selected_orgunits.slice(0, index), ...this.orgunit_model.selected_orgunits.slice(index + 1)];
      }
    });

    this.emit(false);

    // $event.node.isFocused = false;
  }

  // add item to array of selected items when item is selected
  activateOrg = ($event) => {
    this.period_selector.reset();
    if (this.orgunit_model.selection_mode === 'Usr_orgUnit') {
      this.orgunit_model.selection_mode = 'orgUnit';
      this.period_selector.reset();
    }
    this.selected_orgunits = [$event.node.data];
    if (!this.checkOrgunitAvailabilty($event.node.data, this.orgunit_model.selected_orgunits)) {
      this.orgunit_model.selected_orgunits = [...this.orgunit_model.selected_orgunits, $event.node.data];
    }
    this.orgUnit = $event.node.data;
    this.emit(false);
  }

  emit(showUpdate: boolean) {
    const mapper = {};
    this.orgunit_model.selected_orgunits.forEach(function(orgUnit) {
      if (!mapper[orgUnit.level]) {
        mapper[orgUnit.level] = [];
      }
      mapper[orgUnit.level].push(orgUnit);
    });
    const arrayed_org_units = [];
    Object.keys(mapper).forEach(function(orgUnits) {
      arrayed_org_units.push(mapper[orgUnits]);
    });
    if (showUpdate) {
      this.onOrgUnitUpdate.emit({
        orgunit_model: this.orgunit_model,
        starting_name: this.getProperPreOrgunitName(),
        arrayed_org_units: arrayed_org_units,
        items: this.orgunit_model.selected_orgunits,
        name: 'ou',
        orgtree: this.orgtree,
        value: this.getOrgUnitsForAnalytics(this.orgunit_model, this.pickChildren)
      });

      this.onOrgUnitModelUpdate.emit(this.orgunit_model);
    }else {
      this.onOrgUnitChange.emit({
        orgunit_model: this.orgunit_model,
        starting_name: this.getProperPreOrgunitName(),
        arrayed_org_units: arrayed_org_units,
        items: this.orgunit_model.selected_orgunits,
        name: 'ou',
        orgtree: this.orgtree,
        value: this.getOrgUnitsForAnalytics(this.orgunit_model,  this.pickChildren)
      });
      this.onOrgUnitModelUpdate.emit(this.orgunit_model);
    }
  }


  // set selected groups
  setSelectedGroups( selected_groups ) {
    this.orgunit_model.selected_groups = selected_groups;
    this.onOrgUnitModelUpdate.emit(this.orgunit_model);
  }

  // set selected groups
  setSelectedUserOrg( selected_user_orgunit ) {
    this.orgunit_model.selected_user_orgunit = selected_user_orgunit;
    this.emit(false);
  }

  // set selected groups
  setSelectedLevels( selected_levels ) {
    this.orgunit_model.selected_levels = selected_levels;
    this.emit(false);
  }

  sortOrganisationUnitTree(organisationUnits: any[]) {
    return _.map(_.sortBy(organisationUnits, 'name'), (orgUnit) => {
      return orgUnit.children ? {
        ...orgUnit,
        children: this.sortOrganisationUnitTree(orgUnit.children)
      } : orgUnit;
    });
  }

  // prepare a proper name for updating the organisation unit display area.
  getProperPreOrgunitName(): string {
    let name = '';
    if ( this.orgunit_model.selection_mode === 'Group' ) {
      name = (this.orgunit_model.selected_groups.length === 0) ? '' : this.orgunit_model.selected_groups.map((group) => group.name).join(', ') + ' in';
    }else if ( this.orgunit_model.selected_user_orgunit.length !== 0 ) {
      name = (this.orgunit_model.selected_user_orgunit.length === 0) ? '' : this.orgunit_model.selected_user_orgunit.map((level) => level.name).join(', ');
    }else if ( this.orgunit_model.selection_mode === 'Level' ) {
      name = (this.orgunit_model.selected_levels.length === 0) ? '' : this.orgunit_model.selected_levels.map((level) => level.name).join(', ') + ' in';
    }else {
      name = '';
    }
    return name;
  }

  // get user organisationunit name
  getOrgUnitName(id) {
    const orgunit = this.orgtree.treeModel.getNodeById(id);
    return orgunit.name;
  }

  // a function to prepare a list of organisation units for analytics
  getOrgUnitsForAnalytics(orgunit_model: any, with_children: boolean): string {
    const orgUnits = [];
    let organisation_unit_analytics_string = '';
    if ( orgunit_model.selected_user_orgunit.length !== 0 ) {
        orgunit_model.selected_user_orgunit.forEach((orgunit) => {
          organisation_unit_analytics_string += orgunit.id + ';';
        });
    }else {
      // if there is only one organisation unit selected
      if ( orgunit_model.selected_orgunits.length === 1 ) {
        const detailed_orgunit = this.orgtree.treeModel.getNodeById(orgunit_model.selected_orgunits[0].id);
        orgUnits.push(detailed_orgunit.id);
        console.log(detailed_orgunit)
        if (detailed_orgunit.hasOwnProperty('children') && with_children) {
          if (detailed_orgunit.children) {
            for ( const orgunit of detailed_orgunit.children ) {
              orgUnits.push(orgunit.id);
            }
          }
        }

      }else {
        orgunit_model.selected_orgunits.forEach((orgunit) => { // If there is more than one organisation unit selected
          orgUnits.push(orgunit.id);
        });
      }
      if (orgunit_model.selection_mode === 'orgUnit') {

      }if (orgunit_model.selection_mode === 'Level') {
        orgunit_model.selected_levels.forEach((level) => {
          organisation_unit_analytics_string += 'LEVEL-' + level.level + ';';
        });
      }if (orgunit_model.selection_mode === 'Group') {
        orgunit_model.selected_groups.forEach((group) => {
          organisation_unit_analytics_string += 'OU_GROUP-' + group.id + ';';
        });
      }
    }
    return organisation_unit_analytics_string + orgUnits.join(';');
  }




}
