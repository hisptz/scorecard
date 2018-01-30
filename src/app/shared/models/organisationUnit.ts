export interface OrganisationUnit {
  id: string;
  name: string;
  level?: string | number;
  parent?: any[];
  children?: any[];
  path?: string;
}
