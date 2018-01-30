import {User} from './user';

export interface FunctionObject {
  id?: string;
  name?: string;
  displayName?: string;
  function?: string;
  rules?: Array<any>;
  description?: string;
  lastUpdated?: Date;
  created?: Date;
  externalAccess?: boolean;
  userGroupAccesses?: Array<any>;
  attributeValues?: Array<any>;
  translations?: Array<any>;
  userAccesses?: Array<any>;
  publicAccess?: String;
  href?: String;
  user: User;
}
