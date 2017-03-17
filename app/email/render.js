const EmailTemplate = require('email-templates').EmailTemplate;
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templatesDir = path.join(__dirname, 'templates');

// Register the common elements for the emails
const email_base = fs.readFileSync(path.join(__dirname, 'email_base.hbs')).toString();
Handlebars.registerPartial('email_base', email_base);

fs.readdir(templatesDir, (_, dirs) => {
    dirs.filter(d => !d.includes('.')).forEach(dir => {
        const templateDir = path.join(__dirname, 'templates', dir);
        new EmailTemplate(templateDir, {juiceOptions: {
            preserveMediaQueries: true
        }}).render({
            galleries: [
                {
                    caption: "Hello World",
                    gallery_link: "https://www.fresconews.com/",
                    posts: [
                        {
                            image: "http://cdn.dev.fresconews.com/images/269fa35441ad3df330b92555dc12ea67_1488598405211_submission.jpg",
                            link: "https://www.msn.com/",
                            video: true
                        }
                    ],
                    single_post: true
                },
                {
                    caption: "What a wonderful day",
                    gallery_link: "https://www.fresconews.com/",
                    posts: [
                        {
                            image: "http://cdn.dev.fresconews.com/images/200x200/c84b1b3e5929a21c8b6aaf6d2baa9abf_1488598405209_submission.jpg",
                            link: "https://www.yahoo.com",
                            video: true
                        },
                        {
                            image: "http://cdn.dev.fresconews.com/images/200x200/269fa35441ad3df330b92555dc12ea67_1488598405211_submission.jpg",
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
        }, (err, result) => {
            let name = templateDir.split(path.sep).pop();
            if (err) return console.error(`Name: ${name} Error: ${err}`);

            fs.writeFileSync(path.join(templateDir, `${name}.html`), result.html);
        });
    });
});
