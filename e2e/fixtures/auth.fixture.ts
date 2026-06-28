import { test as base } from '@playwright/test';
import { ApiHelper } from '../helpers/api';
import { readSessionToken } from '../helpers/auth-session';

type Fixtures = {
  api: ApiHelper;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    const api = new ApiHelper(request, readSessionToken());
    await use(api);
  },
});

export { expect } from '@playwright/test';
