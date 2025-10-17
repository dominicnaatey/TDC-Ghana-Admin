import axios from 'axios';

declare global {
  interface Window {
    axios: typeof axios;
  }

  // Ziggy route() helper is available globally in this project
  const route: (
    name?: string,
    params?: Record<string, any>,
    absolute?: boolean,
    config?: any
  ) => any;
}

export {};