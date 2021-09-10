import { ICoreClientOptions } from '../core-client.options';
import { ServiceGroupsService } from './service-groups.service';
import { getCookie } from '../utils/get-cookie';

export function onCoreClientInit(
  options: ICoreClientOptions,
  serviceGroupsService: ServiceGroupsService,
) {

  return () => {
    const baseHost = getCookie('base_host');
    // TODO remove this check when ai-communications will be pushed to beta
    if (baseHost !== 'beta.aitheon.com') {
      const messageScript = document.createElement('script');
      messageScript.src = `https://${baseHost}/communications/assets/components/ai-chat.js`;
      messageScript.onload = () => {
        const aiChat = document.createElement('ai-chat');
        document.querySelector('body').appendChild(aiChat);
      };
      document.head.appendChild(messageScript);
    }

    serviceGroupsService.listServiseConfigs().subscribe((configs: any[]) => {
      const currentService = options.service;
      const servicesConfigs = configs.map(s => s.service);

      if (servicesConfigs.includes(currentService)) {
        window.location.href = `/users/dashboard?configService=${currentService}`;
      }

    });

  };
}
