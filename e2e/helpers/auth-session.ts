import fs from 'fs';
import path from 'path';

export const AUTH_SESSION_FILE = 'e2e/.auth/session.json';

type StorageState = {
  origins?: Array<{
    origin: string;
    localStorage?: Array<{ name: string; value: string }>;
  }>;
};

export function readSessionToken(): string {
  const sessionPath = path.resolve(process.cwd(), AUTH_SESSION_FILE);

  if (!fs.existsSync(sessionPath)) {
    throw new Error(
      `Session file not found at ${AUTH_SESSION_FILE}. Run "npm test" to execute auth setup first.`,
    );
  }

  const state = JSON.parse(fs.readFileSync(sessionPath, 'utf-8')) as StorageState;
  const token = state.origins
    ?.flatMap((origin) => origin.localStorage ?? [])
    .find((item) => item.name === 'token')?.value;

  if (!token) {
    throw new Error(`No token found in ${AUTH_SESSION_FILE}. Re-run auth setup.`);
  }

  return token;
}
