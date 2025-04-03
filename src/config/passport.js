const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user");
require("dotenv").config();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use('jwt',
    new Strategy(opts, async (payload, done) => {
        try {
            const user = await User.findById(payload.id);
            if (user) return done(null, user);
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

module.exports = passport;