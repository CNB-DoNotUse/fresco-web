const CronJob = require('cron').CronJob;
const request = require('superagent');
const utils = require('./utils');
const API = require('../lib/api');
const fs = require('fs');

module.exports = (token) => {
    const configFile = './config/temp.json';
    const url = 'https://test-ingest-api.wochit.com/api/v1';
    const basic = 'M2IwNDQ5NmYtZGQ4NS00ZjZlLTlkY2MtMzExZjQxNDZiNDQzOmREUnBiMjgyWkd4a1lXdGlZbVZ5WlROd2RHTndjbXByYldNd05ESmhObXB3YW1ReWFEaHJOV3R0ZGpobWMya3dNM0E9';
    let access_token = '';

    request
    .post(`${url}/oauth/access_token`)
    .set('Authorization', `Basic ${basic}`)
    .set('x-api-key', 'kr7ScZDeMxM1IVM0pjWR3VHmjnWmswi4DsgyUyui')
    .set('Accept', 'application/json')
    .end((err, res) => {
        if(!err) {
            access_token = res.body.token;
            startJob();
        }
    });

    function startJob() {
        let obj = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        const last = obj.last;
        console.log('Last post: ', last)

        API.request({
            url: `/search?posts=true&count=false&limit=32&sortBy=created_at&direction=asc&rating=2&last=${last}`,
            token
        })
        .then(response => {
            sendPosts(response.body.posts.results);
        })
        .catch(error => {
            console.log(error);
        })
    }

    function sendPosts(posts) {
        console.log('Posts found', posts.length)

        if(posts.length === 0 || !posts || typeof(posts) === 'undefined') {
            restart();
        }

        const params = {
             mediaProviderAssetModels: bodyForPost(posts)
        }

        request
        .post(`${url}/assets`)
        .send(params)
        .set('Authorization', `Bearer ${access_token}`)
        .set('x-api-key', 'kr7ScZDeMxM1IVM0pjWR3VHmjnWmswi4DsgyUyui')
        .set('Accept', 'application/json')
        .end((err, res) => {
            if(!err) {
                let last = posts[posts.length - 1].id;
                fs.writeFileSync(configFile, JSON.stringify({ last }), 'utf8');
                restart();
            }
        })
    }

    function restart() {
        console.log('Restarting...');

        setTimeout(startJob, 5000)// 1800000) //30 minutes;
    }


    function bodyForPost(posts) {
        return posts.map((post, i) => {
            const isVideo = post.stream !== null;
            const name = utils.getBylineFromPost(post);

            return {
                id: post.id,
                downloadUrl: post.video || post.image,
                posterUrl: isVideo ? post.image : null,
                type: isVideo ? 'VIDEO' : 'IMAGE',
                title: utils.getBylineFromPost(post, true),
                caption: post.parent.caption,
                contentType: 'Editorial',
                publicationDate: post.captured_at || post.created_at,
                attribution: `${name} / Fresco News`,
                takenByArtist: name
            }
        });
    }
}