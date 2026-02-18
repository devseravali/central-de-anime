import passport from 'passport';
import { configurarPassport } from '../infra/passaportGoogle';

const hasGoogleOAuthConfig = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL,
);

if (hasGoogleOAuthConfig) {
  configurarPassport();
}

export { passport };
