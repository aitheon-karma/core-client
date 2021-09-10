export class Service {
  _id: string;
  name: string;
  description: string;
  enabled: boolean;
  dependencies: Array<string>;
  serviceType: string;
  image: string;
  url: string;
  core: boolean;
}


export const SERVICE_IGNORE_LIST = ['ADMIN', 'AUTH', 'APP_SERVER',
 'TEMPLATE', 'STATUS',
  'MAIL', 'BUILD_SERVER', 'SYSTEM_GRAPH', 'UTILITIES', 'PLATFORM_SUPPORT'];
