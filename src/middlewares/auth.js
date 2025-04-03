const passport = require("passport");
const { getPermissionByRole } = require("../config/role");
const ApiError = require("../utils/ApiError");

const verifyCallBack =
    (req, resolve, reject, requiredRights) => async (err, user, info) => {
        if (err || info || !user) {
            console.log(err, info, user);
            return reject(new ApiError(401, "Please authenticate"));
        }
        req.user = user;

        if (requiredRights.length) {
            try {
                const userPermissions = await getPermissionByRole(user.role);

                const hasRequiredRights = requiredRights.every((requiredRight) =>
                    userPermissions.includes(requiredRight)
                );

                if (!hasRequiredRights && req.params.userId !== user._id) {
                    throw new ApiError(403, "Forbidden");
                }
            } catch (err) {
                return reject(new ApiError(500, "Error fetching role permissions"));
            }
        }
        resolve();
    };

const auth =
    (...requiredRights) =>
        async (req, res, next) => {
            return new Promise((resolve, reject) => {
                passport.authenticate(
                    "jwt",
                    { session: false },
                    verifyCallBack(req, resolve, reject, requiredRights)
                )(req, res, next);
            })
                .then(() => next())
                .catch((err) => next(err));
        };

module.exports = auth;