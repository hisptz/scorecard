import { BaseState, initialBaseState } from './base.state';
import { SystemInfo } from 'src/app/core';

export interface SystemInfoState extends BaseState {
  systemInfo: SystemInfo;
}

export const initialSystemInfoState: SystemInfoState = {
  ...initialBaseState,
  systemInfo: null
};
