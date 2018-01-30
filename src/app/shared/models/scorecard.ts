import {Legend} from './legend';
import {User} from './user';
import {UserGroup} from './user-group';
import {OrgUnitModel} from './org-unit-model';
import {IndicatorHolder} from './indicator-holder';
import {IndicatorHolderGroup} from './indicator-holders-group';
export interface ScoreCard {
  id: string;
  name: string;
  description?: string;
  can_edit?: boolean;
  data: ScorecardData | any;
}
export interface ScorecardData {
    orgunit_settings?: OrgUnitModel;
    average_selection?: string;
    shown_records?: string;
    show_average_in_row?: boolean;
    show_average_in_column?: boolean;
    periodType?: string;
    selected_periods?: any[];
    show_data_in_column?: boolean;
    show_score?: boolean;
    show_rank?: boolean;
    empty_rows?: boolean;
    show_hierarchy?: boolean;
    rank_position_last?: boolean;
    header: {
      title: string,
      sub_title?: string,
      description?: string,
      show_arrows_definition?: boolean,
      show_legend_definition?: boolean,
      template?: {
        display: boolean,
        content: string
      }
    };
    legendset_definitions?: Legend[];
    highlighted_indicators?: {
      display: false,
      definitions: any[]
    };
    data_settings: {
      indicator_holders: IndicatorHolder[],
      indicator_holder_groups: IndicatorHolderGroup[]
    };
    additional_labels?: any[];
    footer?: {
      display_generated_date: string,
      display_title: boolean,
      sub_title: string,
      description: string,
      template: string
    };
    indicator_dataElement_reporting_rate_selection: string;
    user?: User;
    user_groups?: UserGroup[];
}
