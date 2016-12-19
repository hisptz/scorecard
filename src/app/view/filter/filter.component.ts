import {Component, OnInit, Output, EventEmitter, Input, ViewChild} from '@angular/core';
import {Constants} from "../../shared/costants";
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';

const multiselectActionMapping:IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    // click: (node, tree, $event) => {
    //   $event.shiftKey
    //     ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
    //     : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
    // },
    click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
  }
};
const actionMapping:IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
  }
};
const singleSelectActionMapping:IActionMapping = {
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
export class FilterComponent implements OnInit {
  @Output() selected = new EventEmitter<any>();
  @Input() nodes: any = [];
  @Input() tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading_message: 'Loading Items...',
    multiple: true
  };

  showTree:boolean = false;
  selected_items: any[] = [];

  @ViewChild('tree')
  tree: TreeComponent;

  constructor() {

  }

  ngOnInit() {
    // this.activateNode(7)
  }

  activateNode(nodeId:any){
    setTimeout(() => {
      let node = this.tree.treeModel.getNodeById(nodeId);

      if (node)
        node.toggleActivated();
    }, 0);
  }

  deleteNode(nodeId:any){
    let node = this.tree.treeModel.getNodeById(nodeId);
    if (node)
      node.toggleActivated();
  }

  displayTree(){
    this.showTree = true;
  }

  hideTree(){
    console.log('blured')
    this.showTree = false;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivate ( $event ) {
    this.selected_items.forEach((item,index) => {
      if( $event.node.data.id == item.id ) {
        this.selected_items.splice(index, 1);
      }
    })
  };


  // add item to array of selected items when item is selected
  activate = ($event) => {
    this.selected_items.push($event.node.data);
    this.selected.emit($event.node.data);
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
