const request = require('superagent');
const utils = require('./utils');
const API = require('../lib/api');
const fs = require('fs');
const config = require('./config');
const wochit = {
    url: 'https://ingest-api.wochit.com/api/v1',
    basic: 'NmZhNzhjNGUtOTBmOC00NjM3LTliMDEtODg0YzZmMjBlYmEwOlpuUTVORGc0WmpFeGJuTXlZMkZwYkdjMmFqWTVhbUZ6TUhCMk5tZzJiWE5tY1doeWIybGpZWEp2T1RkeWNqUXdjbWs9',
    frescoClient: 'JYPVFS5E0uJ7ATqs2PCijgJ3MvNp44V2MGh1zSoQCdpy9kLoy2RTqOuaS9EMAUVVXGH5p7P1dNPgpcBj7NHzIvcohdY4eWdu8YMPGi0FwvkF78S1Yv7cT2Mw1FDpJvoP',
    apiKey: 'NMfbOZdQbL60XQGYq6Pbd7pkPAT6Hhv14yUJ3Unu'
}

module.exports = () => {
    if(config.DEV) {
        return console.log('Not starting job, in dev mode');
    }

    const configFile = './config/temp.json';
    let access_token = '';
    let timer = null;

    console.log('Starting...');

    getToken();

    function getToken() {
        console.log('Getting token...');

        request
        .post(`${wochit.url}/oauth/access_token`)
        .set('Authorization', `Basic ${wochit.basic}`)
        .set('x-api-key', wochit.apiKey)
        .set('Accept', 'application/json')
        .end((err, res) => {
            if(!err) {
                access_token = res.body.token;
                startJob();
            } else {
                console.log('Error obtaining wochit token');
                console.log(err.response ? err.response.error : err);
            }
        });
    }

    function startJob() {
        timer = null;

        fs.readFile(configFile, 'utf8', (err, data) => {
            if(err) {
                return console.log('Error reading config. Stopping job.', err);
            }

            let obj = JSON.parse(data);
            const last = obj.last;
            console.log('Last post: ', last)

            API.request({
                url: `/search?posts=true&count=false&limit=32&sortBy=created_at&direction=asc&rating=2&last=${last}`,
                token: wochit.frescoClient
            })
            .then(response => {
                sendPosts(response.body.posts.results);
            })
            .catch(error => {
                console.log('Fresco Error:', error);
            });
        });
    }

    function sendPosts(posts) {

        if(posts.length === 0 || !posts || typeof(posts) === 'undefined') {
            console.log('No posts to send. Completely up to date.');
            return restart();
        } else {
            console.log('Sending posts, count of:', posts.length);
        }
        
        console.log('Access Token: ', access_token);

        const params = {
            mediaProviderAssetModels: bodyForPosts(posts)
        }

        request
        .post(`${wochit.url}/assets`)
        .send(params)
        .set('Authorization', `Bearer ${access_token}`)
        .set('x-api-key', wochit.apiKey)
        .set('Accept', 'application/json')
        .end((err, res) => {
            if(!err) {
                let last = posts[posts.length - 1].id;
                fs.writeFile(configFile, JSON.stringify({ last }), 'utf8', (err) => {
                    if(err) {
                        console.log('Error writing to config. Not restarting.', err);
                    } else {
                        return restart();
                    }
                });
            } else if(err && err.response && err.response.error.status == 401) {
                //Get token if un-authnetincated
                getToken();
            } else {
                console.log('Wochit Error. Not restarting.', err);
            }
        })
    }

    function restart() {
        console.log('Restarting...');
        if(timer !== null) {
            console.log('Timer already active.')
        } else {
            timer = setTimeout(startJob, 300000) //5 minutes;
        }
    }

    function bodyForPosts(posts) {
        return posts.map((post, i) => {
            const isVideo = post.stream !== null;
            const name = utils.getBylineFromPost(post);
            const caption = post.parent.caption;
            const captionMaxLength = 50;

            let truncatedCaption = caption.substring(0, captionMaxLength);
            if(caption.length > captionMaxLength) {
                //Truncate until last space so we don't cut off any words and add an ellipsis
                const n = truncatedCaption.lastIndexOf(" ");
                truncatedCaption = truncatedCaption.substring(0, n) + '...';
            }

            return {
                id: post.id,
                downloadUrl: post.video || post.image,
                posterUrl: isVideo ? post.image : null,
                type: isVideo ? 'VIDEO' : 'IMAGE',
                title: truncatedCaption,
                caption,
                keywords: post.parent.tags.length > 0 ? post.parent.tags : [],
                contentType: 'Editorial',
                publicationDate: post.captured_at || post.created_at,
                attribution: `${name} / Fresco News`,
                takenByArtist: name
            }
        });
    }
}