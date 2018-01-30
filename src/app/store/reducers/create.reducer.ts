export interface CreateState {
  action_type?: string;
  need_for_group: boolean;
  need_for_indicator: boolean;
  current_indicator_holder: number;
  current_holder_group: number;
  show_title_editor: boolean;
  next_group_id: number;
  next_holder_id: number;
}

export const initialCreateState = {
  action_type: 'create',
  need_for_group: true,
  need_for_indicator: false,
  current_indicator_holder: 1,
  current_holder_group: 1,
  show_title_editor: false,
  next_group_id: null,
  next_holder_id: null,
};
