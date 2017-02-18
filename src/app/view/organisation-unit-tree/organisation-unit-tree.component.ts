import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {DataService} from "../../shared/data.service";
import {FilterService} from "../../shared/services/filter.service";
import {Constants} from "../../shared/costants";
import {OrgUnitService} from "../../shared/services/org-unit.service";

// costants for enabling the organisation unit tree to have
const actionMapping1:IActionMapping = {
  mouse: {
    click: (node, tree, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
    }
  }
};

const actionMapping:IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
  }
};

@Component({
  selector: 'app-organisation-unit-tree',
  templateUrl: 'organisation-unit-tree.component.html',
  styleUrls: ['organisation-unit-tree.component.css']
})

export class OrganisationUnitTreeComponent implements OnInit {

  // the object that will carry the output value
  @Input() orgunit_model: any = {
    selection_mode: "orgUnit",
    selected_level: "",
    selected_group: "",
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: []
  };

  // The organisation unit configuration object This will have to come from outside.
  @Input() orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: "Select Organisation Unit"
  };

  orgUnit: any = {};

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  organisationunits: any[] = [];

  // this variable controls the visibility of of the tree
  showOrgTree:boolean = true;
  constructor(private dataService: DataService,
              private filterService: FilterService,
              private costant: Constants,
              private orgunitService: OrgUnitService) {

  }

  ngOnInit() {
    this.orgunitService.getOrgunitLevelsInformation()
      .subscribe(
        (data: any) => {
          // assign urgunit levels and groups to variables
          this.orgunit_model.orgunit_levels = data.organisationUnitLevels;
          this.orgunitService.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable
            this.orgunit_model.orgunit_groups = groups.organisationUnitGroups
          });
          if (this.orgunitService.nodes == null) {
            this.orgunitService.getUserInformation().subscribe(
              userOrgunit => {
                let level = this.orgunitService.getUserHighestOrgUnitlevel(userOrgunit);
                let all_levels = data.pager.total;
                let orgunits = this.orgunitService.getuserOrganisationUnitsWithHighestlevel(level,userOrgunit);
                let use_level = parseInt(all_levels) - (parseInt(level) - 1);
                this.orgunit_model.user_orgunits = orgunits;

                //load inital orgiunits to speed up loading speed
                this.orgunitService.getInitialOrgunitsForTree(orgunits).subscribe(
                  (initial_data) => {
                    //noinspection TypeScriptUnresolvedVariable
                    this.orgUnit = {
                      id: initial_data.organisationUnits[0].id,
                      name: initial_data.organisationUnits[0].name,
                      children: initial_data.organisationUnits[0].children
                    };
                    this.orgunit_model.selected_orgunits = [this.orgUnit];
                    // this.orgUnitlength = this.orgUnit.children.length+1;
                    // this.metadata_ready = true;
                    //noinspection TypeScriptUnresolvedVariable
                    this.organisationunits = initial_data.organisationUnits;
                    this.activateNode(this.orgUnit.id, this.orgtree);
                    this.orgunit_tree_config.loading = false;
                    // after done loading initial organisation units now load all organisation units
                    let fields = this.orgunitService.generateUrlBasedOnLevels(use_level);
                    this.orgunitService.getAllOrgunitsForTree1(fields, orgunits).subscribe(
                      items => {
                        //noinspection TypeScriptUnresolvedVariable
                        this.organisationunits = items.organisationUnits;
                        //noinspection TypeScriptUnresolvedVariable
                        this.orgunitService.nodes = items.organisationUnits;
                        this.prepareOrganisationUnitTree(this.organisationunits, 'parent');
                      },
                      error => {
                        console.log('something went wrong while fetching Organisation units');
                        this.orgunit_tree_config.loading = false;
                      }
                    )
                  },
                  error => {
                    console.log('something went wrong while fetching Organisation units');
                    this.orgunit_tree_config.loading = false;
                  }
                )

              }
            )
          }
          else {
            this.orgunit_tree_config.loading = false;
            // this.default_orgUnit = [this.orgunitService.nodes[0].id];
            this.orgUnit = {
              id: this.orgunitService.nodes[0].id,
              name: this.orgunitService.nodes[0].name,
              children: this.orgunitService.nodes[0].children
            };
            this.orgunit_model.selected_orgunits = [this.orgUnit];
            // this.orgUnitlength = this.orgUnit.children.length+1;
            this.organisationunits = this.orgunitService.nodes;
            this.orgunit_model.orgunit_levels = this.orgunitService.orgunit_levels;
            this.orgunitService.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable
              this.orgunit_model.orgunit_groups = groups.organisationUnitGroups
            });
            this.activateNode(this.orgUnit.id, this.orgtree);
            this.prepareOrganisationUnitTree(this.organisationunits, 'parent');
            // TODO: make a sort level information dynamic
            // this.metadata_ready = true;
            // this.loadScoreCard();
          }

        }
      );
  }

  // display Orgunit Tree
  displayOrgTree(){
    this.showOrgTree = !this.showOrgTree;
  }

  activateNode(nodeId:any, nodes){
    setTimeout(() => {
      let node = nodes.treeModel.getNodeById(nodeId);
      if (node)
        node.toggleActivated();
    }, 0);
  }

  prepareOrganisationUnitTree(organisationUnit,type:string='top') {
    if (type == "top"){
      if (organisationUnit.children) {
        organisationUnit.children.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });
        organisationUnit.children.forEach((child) => {
          this.prepareOrganisationUnitTree(child,'top');
        })
      }
    }else{
      console.log("Org Units",organisationUnit)
      organisationUnit.forEach((orgunit) => {
        console.log(orgunit);
        if (orgunit.children) {
          orgunit.children.sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
          orgunit.children.forEach((child) => {
            this.prepareOrganisationUnitTree(child,'top');
          })
        }
      });
    }
  }

}
