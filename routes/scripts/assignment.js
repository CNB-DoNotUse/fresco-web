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
    url: '/assignment/stats'
  }, (err, resp) => {
    if(resp.status == 401) { return res.status(401).send({err: 'ERR_UNAUTHORIZED'}); }
    if(err || resp.status != 200) return res.send({err: 'API Error'});

    let assignments = [],
        xlsxData = [[
          'Assignment ID',
          'Title',
          'Address',
          'Zip Code',
          'Day',
          'Date Created',
          'Users',
          'Submissions',
          'First Submission'
        ]];

    try {

      assignments = JSON.parse(resp.text);

    } catch (e) {
      return res.send({ err: 'API Parse Error' });
    }

    for(let a of assignments) {

      let day = global.getWeekDay(new Date(a.created).getDay());

      xlsxData.push([
        a.id,
        a.title,
        a.address,
        a.zip,
        day,
        new Date(a.created).toLocaleString(),
        a.users,
        a.submissions,
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