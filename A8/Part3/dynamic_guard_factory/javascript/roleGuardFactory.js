function createGuard(...allowedRoles) {
    const allowed = new Set(allowedRoles);

    return function guard(userRole) {
        if (userRole === null || userRole === undefined) {
            return false;
        }

        return allowed.has(userRole);
    };
}

module.exports = {
    createGuard
};