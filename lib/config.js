var config = {
  DEV: true,
  
  STATIC_CDN: 'https://d1dw1p6sgigznj.cloudfront.net/',
  SESSION_SECRET: 'Flerbelerbler heller falala laller',
  
  SESSION_REDIS: {
    ENDPOINT: 'fresco-sessions.cls0l1.ng.0001.use1.cache.amazonaws.com',
    PORT: 6379
  },

  REDIS: {
    SESSIONS: 'prod-sessions-001.cls0l1.0001.use1.cache.amazonaws.com' // Link to sessions DB
  },

  API_VERSION: 'v1',

  // API_URL: 'https://staging.api.fresconews.com',
  // WEB_ROOT : 'https://fresconews.com',
  // STRIPE_SECRET: 'sk_live_QKR23bLkkyHQPF75o6EE36Rp',
  // STRIPE_PUBLISHABLE: 'pk_live_saSjliYnCbjFwYfriTzhTQiO',
  // PARSE_APP_ID: 'XYBXNv2HLxukd5JGbE6bK4vXy1JlwUVjeTKQEzZU',
  // PARSE_API_KEY: 'tpZzCZJCTCk5IJNmNsEMSgxT3nqT4TCjOsZltI0C',
  // PRICE_VIDEO: 7500,
  // PRICE_IMAGE: 3000,

  API_URL: 'http://dev.api.fresconews.com',
  WEB_ROOT: 'http://dev.fresconews.com',
  STRIPE_SECRET: 'sk_test_3gia4iCZFnNXl0tQyGwEggVM ',
  STRIPE_PUBLISHABLE: 'pk_test_o4pMXyj95Vqe5NgV3hb7qmdo',
  PARSE_APP_ID: 'ttJBFHzdOoPrnwp8IjrZ8cD9d1kog01jiSDAK8Fc',
  PARSE_API_KEY: '7zNIxJKt1sNjO1VFj4bYh0sVi3pAfURSZcldf2IN',
  PRICE_VIDEO: 7500,
  PRICE_IMAGE: 3000,

  TWITTER: {
    CONSUMER_KEY: '94rpzX0nPHcRVncdP5tBRHUIp',
    CONSUMER_SECRET: 'ke11m42OxmHI1YGu9it9nKPuGNtDMsVUizCd1ZQtTi5g7IOeF6',
    ACCESS_TOKEN_KEY: '2871169317-Mbv4U5wtRnWt9iCxkhehEEaRNaKqHGowyGBXeMx',
    ACCESS_TOKEN_SECRET: 'DB0OMAsgIeb4PdDafzk5ALedC3MsRPngU9v1FfjkXXLd0'
  },

  //VISIBILITY CONSTANTS
  VISIBILITY: {
    PENDING: 0,
    VERIFIED: 1,
    HIGHLIGHT: 2
  },

  SESSION_REFRESH_MS: 86400000,

  ERR_PAGE_MESSAGES: {
    403: "Unauthorized",
    404: "Page not found!",
    500: "Internal server error"
  },

  //Parse
  PARSE_API: 'https://api.parse.com/',

  DASH_HOME: '/highlights',

  /**
   * Returns purchases for session in an array
   * @param  {express session} session Current usser session
   * @return {array} Array of all the purchases
   */
  mapPurchases: function(session){

    var purchases = [];

    if (session && session.user && session.user.outlet && session.user.outlet.verified) {

      purchases = session.user.outlet.purchases || [];
      
      purchases = purchases.map(function(purchase) {
        return purchase.post;
      });

    }

    return purchases;

  }
  
};

module.exports = config;
