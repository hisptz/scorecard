import {Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation} from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import {Observable} from 'rxjs';
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {DataService} from "./data.service";
import {FilterService} from "./services/filter.service";

const actionMapping:IActionMapping = {
    mouse: {
        dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
        click: (node, tree, $event) => {
            $event.shiftKey
                ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
                : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
        }
    }
};

@Component({
  selector: 'dhis-org-unit-tree',
  templateUrl: `
<div *ngIf="loading">{{ tree_config.loading_message }}</div>
<form *ngIf="!loading && tree_config.show_search" >
  <input #filter (keyup)="filterNodes(filter.value, tree)" placeholder="{{ tree_config.search_text }}" id="search_field"/>
</form>
<Tree
    #tree
    [nodes]="nodes"
    [focused]="true"
    [options]="customTemplateStringOptions"
    (onActivate)="activate($event)"
    (onDeactivate)="deactivate($event)"
>
  <template #treeNodeTemplate let-node>
    <span>{{ node.data.name }}</span>
  </template>
</Tree>
`,
  encapsulation: ViewEncapsulation.None
})
export class DhisOrgUnitTreeComponent implements OnInit, OnDestroy {
    nodes: any[] = null;
    loading:boolean = true;
    out_orgunits = [];
    @Output() selected = new EventEmitter<any>();
    @Input() dhis2_url: string = '../../../';
    @Input() tree_config: any = {
        show_search : false,
        search_text : 'Search',
        level: null,
        loading_message: 'Loading Organisation units...'
    };

    private subscription: Subscription;

    constructor(  private http: Http, private dataService: DataService, private filterService: FilterService)  {
      if (dataService.nodes == null){
        this.subscription = this.getOrgunitLevelsInformation()
            .subscribe(
                (data: any) => {
                  this.filterService.getInitialOrgunitsForTree().subscribe(
                    (initial_data) => {
                      this.nodes = initial_data.organisationUnits;
                      this.loading = false;
                      let fields = this.generateUrlBasedOnLevels( data.pager.total);
                      this.getAllOrgunitsForTree( fields )
                        .subscribe(
                          (orgUnits: any) => {

                            this.nodes = orgUnits.organisationUnits;
                            dataService.nodes = orgUnits.organisationUnits;
                            this.sortOrgUnits( data.pager.total );
                          },
                          error => {
                            console.log('something went wrong while fetching Organisation units')
                          }
                        );
                    });
                },
                error => {
                    console.log('something went wrong while fetching Organisation units ')
                }
            );
      }else{
        this.loading = false;
        this.nodes = dataService.nodes;
        this.sortOrgUnits( 4 );
      }
    }

    sortOrgUnits ( level ) {
      let main = [];
      this.dataService.sortArrOfObjectsByParam( this.nodes, 'name' );
      for ( let data of this.nodes ){
        if( level > 1) {
          this.dataService.sortArrOfObjectsByParam( data.children, 'name' );
          if( level > 2 ){
            for ( let subdata of data.children ) {
              this.dataService.sortArrOfObjectsByParam( subdata.children, 'name' );
              if( level > 3 ){
                for ( let subdata1 of subdata.children ) {
                  this.dataService.sortArrOfObjectsByParam( subdata1.children, 'name' );
                }
              }
            }
          }

        }
      }
    }

    ngOnInit (){}

    deactivate ( $event ) {
      // this.selected.emit($event.node.data);
    };

    activate = ($event) => {
        this.selected.emit($event.node.data);
    };

    generateUrlBasedOnLevels (level: number){
        var fields: string;
        if ( level == 1 ) {
            fields = 'id,name';
        }else if ( level == 2 ) {
            fields = 'id,name,children[id,name]';
        }else if ( level == 3 ) {
            fields = 'id,name,children[id,name,children[id,name]]';
        }else if ( level == 4 ) {
            fields = 'id,name,children[id,name,children[id,name,children[id,name]]]';
        }else if ( level == 5 ) {
            fields = 'id,name,children[id,name,children[id,name,children[id,name,children[id,name]]]]';
        }

        return fields;
    }

    // Get system wide settings
    getOrgunitLevelsInformation () {
        return this.http.get(this.dhis2_url + 'api/organisationUnitLevels.json?fields=id')
            .map((response: Response) => response.json())
            .catch( this.handleError );
    }

    // Get system wide settings
    getAllOrgunitsForTree (fields) {
        return this.http.get(this.dhis2_url + 'api/organisationUnits.json?filter=level:eq:1&paging=false&fields=' + fields)
            .map((response: Response) => response.json())
            .catch( this.handleError );
    }

    // Handling error
    handleError (error: any) {
        return Observable.throw( error );
    }

    childrenCount(node: TreeNode): string {
        return node && node.children ? `(${node.children.length})` : '';
    }

    filterNodes(text, tree) {
        tree.treeModel.filterNodes(text, true);
    }

    activateSubSub(tree) {
        tree.treeModel.getNodeBy((node) => node.data.name === 'subsub')
            .setActiveAndVisible();
    }

    customTemplateStringOptions = {
        // displayField: 'subTitle',
        isExpandedField: 'expanded',
        actionMapping
    }

    go($event) {
        $event.stopPropagation();
        alert('this method is on the app component')
    }

    ngOnDestroy (){
      if( this.subscription ){
        this.subscription.unsubscribe();
      }
    }

}
