const mandrill = require('mandrill-api/mandrill');
const EmailTemplate = require('email-templates').EmailTemplate;
const fs = require('fs');
const path = require('path');
const startCase = require('lodash/startCase');

const dev = process.env.NODE_ENV === 'development';
const mandrillClient = new mandrill.Mandrill('Wm-tSNLBNAMbt4xT_ouWKg');
const templatesDir = path.join(__dirname, 'templates');

const footerTemplate = fs.readFileSync(path.join(__dirname, 'footer.hbs')).toString();
Handlebars.registerPartial('footer', footerTemplate);

const updateTemplate = (name, data) => {
    mandrillClient.templates.update({
        name,
        subject: data.subject,
        code: data.html,
        labels: dev ? ['dev'] : ['prod'],
    });
};

const createTemplate = (name, data) => {
    mandrillClient.templates.add({
        name,
        subject: data.subject,
        publish: false,
        code: data.html,
        from_name: 'Fresco News',
        from_email: 'donotreply@fresconews.com',
        labels: dev ? ['dev'] : [],
    });
};

fs.readdir(templatesDir, (_, dirs) => {
    dirs.filter(d => !d.includes('.')).forEach((dir) => {
        const templateDir = path.join(__dirname, 'templates', dir);
        new EmailTemplate(templateDir, {juiceOptions: {
            preserveMediaQueries: true
        }}).render({}, (err, result) => {
            let name = templateDir.split(path.sep).pop();
            name = dev ? `Dev ${startCase(name)}` : startCase(name);

            if (err) console.error('err: ', err);

            mandrillClient.templates.info({ name }, () => {
                updateTemplate(name, result);
            }, (e) => {
                if (e.name === 'Unknown_Template') createTemplate(name, result);
            });
        });
    });
});
