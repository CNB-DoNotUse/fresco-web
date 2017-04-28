const request = require('superagent');
const utils = require('./utils');
const API = require('../lib/api');
const fs = require('fs');
const wochit = {
    url: 'https://internal-ingest-api.wochit.com/api/v1',
    basic: 'MzczNGNiMGUtNDM4My00YTUzLThmZGQtZDI5ODkxMGQxMWRjOmRtODBkbXRxWnpZMWRuSjBibWMzTWpJemEzVXhZaloxTW13NU1IUnlkVEZ5WW1SdFpEUmhZV2hoT0hWblpXaHdhR009',
    frescoClient: 'JYPVFS5E0uJ7ATqs2PCijgJ3MvNp44V2MGh1zSoQCdpy9kLoy2RTqOuaS9EMAUVVXGH5p7P1dNPgpcBj7NHzIvcohdY4eWdu8YMPGi0FwvkF78S1Yv7cT2Mw1FDpJvoP',
    apiKey: '3734cb0e-4383-4a53-8fdd-d298910d11dc'
}

module.exports = () => {
    const configFile = './config/temp.json';
    let access_token = '';

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
                console.log(err.response ? err.response.error : err);
            }
        });
    }

    function startJob() {
        let obj = JSON.parse(fs.readFileSync(configFile, 'utf8'));
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
    }

    function sendPosts(posts) {
        console.log('Sending posts, count of:', posts.length);
        console.log('Access Token: ', access_token);

        if(posts.length === 0 || !posts || typeof(posts) === 'undefined') {
            restart();
        }

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
                fs.writeFileSync(configFile, JSON.stringify({ last }), 'utf8');
                restart();
            } else if(err && err.response && err.response.error.status == 401) {
                //Get token if un-authnetincated
                getToken();
            }
        })
    }

    function restart() {
        console.log('Restarting...');
        setTimeout(startJob, 5000)// 1800000) //30 minutes;
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