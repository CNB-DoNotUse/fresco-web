//Roles helper functions

export const can = (user, role) => {
    return user.roles.includes(role);
}