const helper = {
    // returns a boolean on whether the user object has admininstrator roles
    isAdmin: (user) => {
        return user.roles.some((role) => role.tag === "admin" );
    },

    // returns a boolean on whether an array of role objects has administrator roles
    rolesHasAdmin: (roles) => {
        return roles.some((role) => role.tag === "admin" );
    },

    canDownload: (user) => {
        return user.roles.some((role) => role.tag === "download-temp" );
    },
    // modifies a user object based on whether it has administrator roles
    userAdminRoles: (user) => {
        if (helper.isAdmin(user)) user.admin = true;
        if (helper.canDownload(user)) user.canDownload = true;
        return user;
    }
}

module.exports = helper;
