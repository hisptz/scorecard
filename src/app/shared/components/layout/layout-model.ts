export interface LayoutModel {
  rows: Array<{
    name: string;
    value: string;
  }>;
  columns: Array<{
    name: string;
    value: string;
  }>;
  filters: Array<{
    name: string;
    value: string;
  }>
  excluded: Array<{
    name: string;
    value: string;
  }>
}

export const INITIAL_LAYOUT_MODEL: LayoutModel = {
  rows: [{
      name: 'Period',
      value: 'pe'
    }],
  columns: [{
    name: 'Data',
    value: 'dx'
  }],
  filters: [{
    name: 'Organisation Units',
    value: 'ou'
  }],
  excluded: [{
    name: 'Excluded Dimension',
    value: 'co'
  }]
}
