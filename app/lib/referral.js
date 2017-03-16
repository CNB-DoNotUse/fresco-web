/**
 * Merge the referral parameters into the given object (to send up to analytics services)
 * @param  {Object} [params={}] The other parameters to merge into
 * @return {[type]}             The same object, with referral parameters added, prefixed by 'referral_'
 */
export const mergeReferral = (params = {}) => {
    for(let referral_param in window.referral) {
        params['referral_' + referral_param] = window.referral[referral_param]
    }
    return params;
}
