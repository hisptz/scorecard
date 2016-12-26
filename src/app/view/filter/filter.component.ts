import {Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit} from '@angular/core';
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';


// const actionMapping:IActionMapping = {
//   mouse: {
//     dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
//     click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
//   }
// };
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
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, AfterViewInit {
  @Output() selected = new EventEmitter<any>();
  @Input() nodes: any = [];
  @Input() pre_selected: any[] = [];
  @Input() tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading_message: 'Loading Items...',
    multiple: true,
    loading: false,
    placeholder:"---select---"
  };

  showTree:boolean = true;
  selected_items: any[] = [];

  @ViewChild('tree')
  tree: TreeComponent;

  constructor() {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    for( let item of this.pre_selected ){
      this.activateNode(item);
    }
  }

  activateNode(nodeId:any){
    setTimeout(() => {
      let node = this.tree.treeModel.getNodeById(nodeId);

      if (node)
        node.toggleActivated();
    }, 0);
  }

  displayTree(){
    this.showTree = !this.showTree;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivate ( $event ) {
  // this.selected_items.forEach((item,index) => {
  //   if( $event.node.data.id == item.id ) {
  //     this.selected_items.splice(index, 1);
  //   }
  // });
  // this.selected.emit(this.selected_items);
};


  // add item to array of selected items when item is selected
  activate = ($event) => {
    //this is a hack remove it next time;
    this.selected_items = [];
    this.selected_items.push($event.node.data);
    this.selected.emit(this.selected_items);
  };

  // return the number of children for a specific node
  childrenCount(node: TreeNode): string {
    return node && node.children ? `(${node.children.length})` : '';
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  activateSubSub(tree) {
    tree.treeModel.getNodeBy((node) => node.data.name === 'subsub')
      .setActiveAndVisible();
  }


  customTemplateStringOptions: any = {
    // displayField: 'subTitle',
    isExpandedField: 'expanded',
    actionMapping
  };
}
