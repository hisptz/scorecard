export interface OrgUnitModel {
  selection_mode: string;
  selected_level: string;
  show_update_button: boolean;
  selected_group: string;
  orgunit_levels: any[];
  orgunit_groups: any[];
  selected_orgunits: any[];
  user_orgunits: any[];
  type: string; // can be 'data_entry'
  selected_user_orgunit: string[];
}
