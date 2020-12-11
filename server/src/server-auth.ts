import express from 'express';
import passport from 'passport';
import { NetFlowUser } from '../../shared/models/account-dto';

export class AuthRoutes {

  public static Add(app: express.Express) {

    var GoogleStrategy = require('passport-google-oauth20').Strategy;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
      function (accessToken: any, refreshToken: any, profile: any, cb: any) {
        return cb(null, profile);
      }
    ));

    passport.serializeUser(function (user: any, done) {
      if (user.provider === 'google') {
        let netflowUser: NetFlowUser = user;

        done(null, netflowUser); // store the whole user
      }
      done(null, user); // store the whole user
    });

    passport.deserializeUser(function (user, done) {
      console.log("HELLLOOOOOOOOOOOOOOOOOOOOOOOOOOO");
      done(null, user);
    });


    app.get('/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      function (req, res) {
        // create user if new
        // update/merge 'google' node if existing
        // new AccountDal().update(req.user as NetFlowUser);
        console.log(req);
        res.redirect('/user');
      });

  }
}
