import {Action} from '@ngrx/store';
import {Dataset} from '../../shared/services/dataset.service';

export const LOAD_DATASET = '[Datasets] Load Datasets';
export const LOAD_DATASET_FAIL = '[Datasets] Load Datasets Fail';
export const LOAD_DATASET_COMPLETE = '[Datasets] Load Datasets Complete';

export class LoadDatasets implements Action {
  readonly type = LOAD_DATASET;
}

export class LoadDatasetsFail implements Action {
  readonly type = LOAD_DATASET_FAIL;
  constructor(public payload: any) {}
}

export class LoadDatasetsSuccess implements Action {
  readonly type = LOAD_DATASET_COMPLETE;
  constructor(public payload: Dataset[]) {}
}

export type DatasetsActions = LoadDatasets| LoadDatasetsFail | LoadDatasetsSuccess;
