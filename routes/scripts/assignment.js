var express = require('express'),
    config = require('../../lib/config'),
    global = require('../../lib/global'),
    API = require('../../lib/api'),
    xlsx = require('node-xlsx'),
    router = express.Router();
	
//---------------------------vvv-ASSIGNMENT-ENDPOINTS-vvv---------------------------//
router.get('/assignment/stats', (req, res) => {
  // if(!req.session.user || req.session.user.rank < 1) return res.status(403).send({ err: 'Unauthorized' });

  API.request({
    method: 'GET',
    url: '/assignment/stats',
    token: req.session.token
  }, (err, resp) => {
    if(err || resp.status != 200) return res.send({err: 'API Error'});

    let assignments = [],
        xlsxData = [[
          'Assignment ID',
          'Outlet ID',
          'Outlet',
          'Creator',
          'Transferred',
          'Title',
          'Address',
          'Zip Code',
          'Radius',
          'Day',
          'Date Created',
          'Time Created',
          'Users',
          'Submissions',
          'Photos',
          'Photos Purchased',
          'Videos',
          'Videos Purchased',
          'First Submission'
        ]];

    try {

      assignments = JSON.parse(resp.text);

    } catch (e) {
      return res.send({ err: 'API Parse Error' });
    }

    for(let a of assignments) {

      xlsxData.push([
        a.id,
        a.outletid,
        a.outlet_name,
        a.creator,
        a.transferred,
        a.title,
        a.address,
        a.zip,
        a.radius,
        global.getWeekDay(a.day_created),
        a.date_created,
        a.created_at,
        a.users,
        a.submissions,
        a.photos,
        a.photos_purchased,
        a.videos,
        a.videos_purchased,
        a.firstSubmissionTime
      ]);

    }

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Disposition', 'inline; filename="AssignmentStats.xlsx"')
    res.send(xlsx.build([{name: 'Assignments', data: xlsxData}]));

  });

});
//---------------------------^^^-ASSIGNMENT-ENDPOINTS-^^^---------------------------//

module.exports = router;