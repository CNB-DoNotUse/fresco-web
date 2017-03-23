import Smooch from 'smooch';

/**
 * Starts in-browser chat for us with Smooch
 */
module.exports = () => {
    const customText = {
        headerText: 'Ask us anything'
    }
    const appToken = 'bmk6otjwgrb5wyaiohse0qbr0';

    if (window.__initialProps__ && window.__initialProps__.user) {
        const outletId = window.__initialProps__.user.outlet_id ? window.__initialProps__.user.outlet_id : '';
        const userId = window.__initialProps__.user.id;

        Smooch.init({
            appToken,
            customText,
            givenName: window.__initialProps__.user.full_name,
            email: window.__initialProps__.user.email,
            userId,
            properties: {
                'outletId': outletId
            }
        });
    } else {
        Smooch.init({ appToken, customText });
    }
}