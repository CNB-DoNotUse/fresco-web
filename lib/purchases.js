// TODO: this file might be obsolete with v2, purchase flag now set on posts json
var Purchases = {
    /**
    * Returns purchases for session in an array
    * @param  {express session} session Current user session
    * @return {array} Array of all the purchases
    */
    mapPurchases: function(session){
        var purchases = [];

        if (session && session.user && session.user.outlet && session.user.outlet.verified) {

            purchases = session.user.outlet.purchases || [];

            purchases = purchases.map(function(purchase) {
                //For some reasons, the purhcase object is different, and it sometimes just the post id, so I check ehre
                if(!purchase.post)
                    return purchase
                else
                    return purchase.post;
            });

        }

        return purchases;
    }
}

module.exports = Purchases;
