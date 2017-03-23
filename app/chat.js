import Smooch from 'smooch';

/**
 * Starts in-browser chat for us with Smooch
 */
module.exports = () => {
    Smooch.init({
        appToken: 'bmk6otjwgrb5wyaiohse0qbr0',
        customText: {
            headerText: 'Ask us anything'
        }
    });

    if (window.user) {
        Smooch.updateUser({
            givenName: user.full_name,
            email: user.email,
            properties: {
                frescoId: user.id
            }
        })
    }
}