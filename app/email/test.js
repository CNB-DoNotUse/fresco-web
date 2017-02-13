const mandrill = require('mandrill-api/mandrill');
const fs = require('fs');
const path = require('path');
const startCase = require('lodash/startCase');

const mandrillClient = new mandrill.Mandrill('Wm-tSNLBNAMbt4xT_ouWKg');
const templatesDir = path.join(__dirname, 'templates');
const argv = require('yargs').argv;

if (!argv.email) {
    console.log('Requires --email command line argument');
    return;
}

const testMessage = {
    to: [{
        email: argv.email,
        name: 'Test bro',
        type: 'to',
    }],
    merge_language: 'handlebars',
    global_merge_vars: [{
        name: 'assignment',
        content: 'test assignment',
    }, {
        name: 'url',
        content: 'dev.fresconews.com',
    }, {
        name: 'title',
        content: 'test title',
    }, {
        name: 'reason',
        content: 'test reason',
    }, {
        name: 'link',
        content: 'dev.fresconews.com',
    }, {
        name: 'outlet',
        content: 'test outlet',
    }, {
        name: 'name',
        content: 'test name',
    }, {
        name: 'email',
        content: 'test email',
    }, {
        name: 'phone',
        content: '111 111 1111',
    }, {
        name: 'zip',
        content: '10023',
    }, {
        name: 'time',
        content: '9:30 am',
    }, {
        name: 'amount',
        content: '20',
    }, {
        name: 'outlet_type',
        content: 'news station',
    }, {
        name: 'outlet_location',
        content: 'canada',
    }, {
        name: 'contact_name',
        content: 'test contact name',
    }, {
        name: 'contact_email',
        content: 'test contact email',
    }, {
        name: 'contact_phone',
        content: 'test contact phone',
    }, {
        name: 'body',
        content: 'THIS IS A BODY!!!!!!'
    }, {
        name: 'model',
        content: {
            name: 'Google',
            link: 'https://www.google.com'
        }
    }, {
        name: 'galleries',
        content: [
            {
                caption: "Hello World",
                gallery_link: "https://www.fresconews.com/",
                posts: [
                    {
                        image: "https://d2j1l98c0ybckw.cloudfront.net/images/55f47fed5fdc140b5b338997_1442086894671.jpeg",
                        link: "https://www.msn.com/"
                    }
                ],
                single_post: true
            },
            {
                caption: "What a wonderful day",
                gallery_link: "https://www.fresconews.com/",
                posts: [
                    {
                        image: "https://d2j1l98c0ybckw.cloudfront.net/images/55f47fed5fdc140b5b338997_1442086894671.jpeg",
                        link: "https://www.yahoo.com"
                    },
                    {
                        image: "https://d2j1l98c0ybckw.cloudfront.net/images/55f47fed5fdc140b5b338997_1442086894671.jpeg",
                        link: "https://www.aol.com/"
                    },
                    {
                        image: "https://d2j1l98c0ybckw.cloudfront.net/images/55f47fed5fdc140b5b338997_1442086894671.jpeg",
                        link: "https://www.cnn.com/"
                    },
                    {
                        image: "https://d2j1l98c0ybckw.cloudfront.net/images/55f47fed5fdc140b5b338997_1442086894671.jpeg",
                        link: "https://www.verizon.com/"
                    }
                ],
                single_post: false
            }
        ]
    }],
};

const sendTemplate = (name) => {
    mandrillClient.messages.sendTemplate({
        template_name: name,
        template_content: [],
        message: testMessage,
    });
};

fs.readdir(templatesDir, (_, dirs) => {
    dirs.filter(d => !d.includes('.')).forEach((dir) => {
        const templateDir = path.join(__dirname, 'templates', dir);
        let name = templateDir.split(path.sep).pop();
        name = `Dev ${startCase(name)}`;

        mandrillClient.templates.info({ name }, () => {
            sendTemplate(name);
        }, (e) => {
            console.error(e);
        });
    });
});
