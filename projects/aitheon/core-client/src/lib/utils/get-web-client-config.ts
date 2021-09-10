import { Environment, WebClientConfig } from '@aitheon/ai-web-client-angular';
import { Cookie } from '../services/cookie';

export function getWebClientConfig(): WebClientConfig {
  let mode: string;
  switch (Cookie.get('base_host')) {
    case 'aitheon.com':
      mode = Environment.production;
      break;
    case 'dev.aitheon.com':
    case undefined:
      mode = Environment.dev;
      break;
    case 'beta.aitheon.com':
      mode = Environment.beta;
      break;
    default:
      mode = Environment.dev;
  }

  return {
    mode,
    deploymentEnvironment: mode,
    key: mode === 'production' ? '5f060b0b7a126100139dac60' : '5eb3aee86db73a69a7b54d67',
  } as WebClientConfig;
}
