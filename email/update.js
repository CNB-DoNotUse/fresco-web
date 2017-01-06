const mandrill = require('mandrill-api/mandrill');
const EmailTemplate = require('email-templates').EmailTemplate;
const fs = require('fs');
const path = require('path');

const mandrillClient = new mandrill.Mandrill('Wm-tSNLBNAMbt4xT_ouWKg');
const templatesDir = path.join(__dirname, 'templates');

fs.readdir(templatesDir, (_, dirs) => {
    dirs.filter(d => !d.includes('.')).forEach((dir) => {
        const templateDir = path.join(__dirname, 'templates', dir);
        new EmailTemplate(templateDir).render({}, (err, result) => {
            if (err) console.error(err);
            if (result) console.log(result.html);
        });
    });
});

