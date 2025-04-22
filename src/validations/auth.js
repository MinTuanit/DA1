const Joi = require("joi");
const { password } = require("./custom");

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        full_name: Joi.string().required(),
        dateOfBirth: Joi.string().required(),
        cccd: Joi.string().required(),
        phone: Joi.string().required(),
        role: Joi.string()
        .required()
        .valid('customer', 'employee'),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};
const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const resetPassword = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().required().custom(password),
    }),
};

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    resetPassword,
};