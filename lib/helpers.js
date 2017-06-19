const helper = {
    // returns a boolean on whether the user object has admininstrator roles
    isAdmin: (user) => {
        return user.roles.some((role) => role.name === "Administrator" );
    },

    // returns a boolean on whether an array of role objects has administrator roles
    rolesHasAdmin: (roles) => {
        return roles.some((role) => role.name === "Admininstrator" );
    },

    // modifies a user object based on whether it has administrator roles
    userAdminRoles: (user) => {
        if (helper.isAdmin(user)) user.admin = true;
        return user;
    }
}

module.exports = helper;
