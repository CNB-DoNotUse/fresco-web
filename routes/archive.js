var express     = require('express'),
    config      = require('../lib/config'),
    Purchases   = require('../lib/purchases'),
    global      = require('../lib/global'),
    request     = require('request-json'),
    router      = express.Router(),
    api         = request.createClient(config.API_URL)

/** //

	Description : Content Specific Routes ~ prefix /content/~

// **/

/**
 * Index Content Page
 */

router.get('/', (req, res, next) => {

  var title = 'Archive',
      props = {
        user : req.session.user,
        purchases : Purchases.mapPurchases(req.session),
        title: title
      };

  res.render('app', {
    title: title,
    page : 'archive',
    alerts: req.alerts,
    props : JSON.stringify(props)
  });

});

/**
 * Page for all galleries
 */

router.get('/galleries', (req, res, next) => {
    const title = 'Galleries';
    const props = {
        user: req.session.user,
        title,
    };

    res.render('app', {
        user: req.session.user,
        title: title,
        config: config,
        alerts: req.alerts,
        page: 'galleries',
        props : JSON.stringify(props)
    });

});

/**
 * Page for all stories
 */

router.get('/stories', (req, res, next) => {
  var title = 'Stories',
      props = {
        user : req.session.user
      };

  res.render('app', {
    title: title,
    config: config,
    alerts: req.alerts,
    page: 'stories',
    props : JSON.stringify(props)
  });

});

/**
 * Filters between photos or videos
 * @param {string} filter Filter of content type i.e. videos/photos
 */

router.get('/:filter', (req, res, next) => {
  var filters = ['photos', 'videos'];

  // Check if filter is valid
  if(filters.indexOf(req.params.filter.toLowerCase()) == -1) {
    return res.redirect('/');
  }

  var props = {
    user : req.session.user,
    purchases : Purchases.mapPurchases(req.session)
  },
  title = req.params.filter[0].toUpperCase() + req.params.filter.slice(1);

  res.render('app', {
    title: title,
    page : req.params.filter,
    alerts: req.alerts,
    props : JSON.stringify(props)
  });

});


module.exports = router;
