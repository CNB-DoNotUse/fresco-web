const express   = require('express');
const config    = require('../lib/config');
const router    = express.Router();

/**
 * API Docs page
 */
router.get('/api', (req, res, next) => {
  res.render('docs', {
      page: 'docs',
      title: 'API Docs',
      docs: config.DOCS
  });
});

module.exports = router;
