export interface ScorecardUserGroup {
  id: string;
  name: string;
  title?: string;
  edit?: boolean;
  users?: {
    id: string
  };
}
