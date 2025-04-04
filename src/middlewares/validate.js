const Joi = require("joi");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(req, Object.keys(validSchema));

    const { value, error } = Joi.compile(Joi.object(validSchema))
        .prefs({ errors: { label: "key" }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        return next(new ApiError(400, errorMessage));
    }

    Object.assign(req, value);
    return next();
};

module.exports = validate;