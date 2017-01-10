const mandrill = require('mandrill-api/mandrill');
const EmailTemplate = require('email-templates').EmailTemplate;
const fs = require('fs');
const path = require('path');
const startCase = require('lodash/startCase');

const dev = process.env.NODE_ENV === 'development';
const mandrillClient = new mandrill.Mandrill('Wm-tSNLBNAMbt4xT_ouWKg');
const templatesDir = path.join(__dirname, 'templates');

const updateTemplate = (name, data) => {
    mandrillClient.templates.update({
        name,
        subject: data.subject,
        code: data.html,
        labels: dev ? ['dev'] : [],
    });
};

const createTemplate = (name, data) => {
    mandrillClient.templates.add({
        name,
        subject: data.subject,
        code: data.html,
        from_name: 'Fresco News',
        from_email: 'donotreply@fresconews.com',
        labels: dev ? ['dev'] : [],
    });
};

fs.readdir(templatesDir, (_, dirs) => {
    dirs.filter(d => !d.includes('.')).forEach((dir) => {
        const templateDir = path.join(__dirname, 'templates', dir);
        new EmailTemplate(templateDir).render({}, (err, result) => {
            const name = startCase(templateDir);
            if (err) console.error(err);
            if (result) console.log(result.html);

            // mandrillClient.info({ name }, () => {
            //     updateTemplate(result);
            // }, (e) => {
            //     if (e.name === 'Unknown_Template') createTemplate(result);
            // });
        });
    });
});

