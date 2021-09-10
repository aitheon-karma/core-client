export class Notification {
  _id: string;
  title: string;
  read: boolean;
  actionType: string;
  actionData: any;
  createdAt: Date;

}

export class Task {
  _id: string;
  name: string;
  description: string;
  orderIndex: number;
  priority: number;
  state: string;
  type: string;
  recurring: boolean;
  addToCalendar: boolean;
  createdBy: any;
  project?: any;
  parentTask?: any;
  assigned?: Array<any>;
  dismissed?: Array<any>;
  service: string;
  organization?: any;
  startDate?: any;
  finishDate?: any;
  createdAt: string;
  updatedAt: string;
  remainingHours: number;
  dependencies?: Array<any>;
  dependents?: Array<any>;
  loggedTime: Array<any>;
  estimatedCompletionDays: any;
  action: Action;
  read: boolean;
  isNotify: boolean;
  assignedToDevice: string;
  assignedToSystem: string;
}

export class Action {
  name: string;
  redirect: string;
  referenceId: string;
  data?: any;
}

export enum TaskType {
  TASK = 'TASK',
  MILESTONE = 'MILESTONE',
  EVENT = 'EVENT',
  NOTIFICATION = 'NOTIFICATION',
  EPIC = 'EPIC'
}

export enum CoreServices {
  APP_SERVER = 'APP_SERVER',
  AUTH = 'AUTH',
  BILLING_MANAGER = 'BILLING_MANAGER',
  COMMUNITY = 'COMMUNITY',
  CONTACTS = 'CONTACTS',
  DRIVE = 'DRIVE',
  LANDING = 'LANDING',
  MAIL = 'MAIL',
  MAILBOX = 'MAILBOX',
  MESSAGES = 'MESSAGES',
  OFFICE = 'OFFICE',
  STATUS = 'STATUS',
  TEMPLATE = 'TEMPLATE',
  BUILD_SERVER = 'BUILD_SERVER',
  PLATFORM_SUPPORT = 'PLATFORM_SUPPORT',
  SYSTEM_GRAPH = 'SYSTEM_GRAPH',
  UTILITIES = 'UTILITIES'
}
