import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  type Profile,
} from 'passport-google-oauth20';
import { ErroApi } from '../errors/ErroApi';

export function configurarPassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    throw ErroApi.internalServerError(
      'Google OAuth não configurado corretamente',
      'GOOGLE_OAUTH_CONFIG_ERROR',
    );
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done,
      ) => {
        try {
          return done(null, {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            nome: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}