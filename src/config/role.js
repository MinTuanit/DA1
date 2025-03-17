const allRoles = {
    customer: [
        "getUserById",
        "getUserByEmail",
    ],
    employee: [
        "getUserById",
        "getUserByEmail",
    ],
    admin: [
        "getUserById",
        "getUserByEmail",
    ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

const getPermissionByRole = (roleName) => {
    return roleRights.get(roleName);
};

module.exports = {
    roles,
    roleRights,
    getPermissionByRole,
};
