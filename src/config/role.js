const allRoles = {
    customer: [
        "getUserByEmail",
        "getCinema",
        "getDiscount",
        "getEmployee",
        "getMovie",
        "getProduct",
        "getRoom",
        "getSeat",
        "getShowTime",
        "getUser",
    ],
    employee: [
        "getUserByEmail",
        "getCinema",
        "getDiscount",
        "getEmployee",
        "getMovie",
        "getProduct",
        "getRoom",
        "getSeat",
        "getShowTime",
        "getUser",
    ],
    admin: [
        "getUserByEmail",
        "getCinema",
        "getDiscount",
        "getEmployee",
        "getMovie",
        "getProduct",
        "getRoom",
        "getSeat",
        "getShowTime",
        "getUser",
        "manageCinema",
        "manageDiscount",
        "manageEmployee",
        "manageMovie",
        "manageProduct",
        "manageRoom",
        "manageSeat",
        "manageShowTime",
        "manageUser"
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
