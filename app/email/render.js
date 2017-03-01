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
        }}).render({}, (err, result) => {
            let name = templateDir.split(path.sep).pop();
            if (err) return console.error(`Name: ${name} Error: ${err}`);

            fs.writeFileSync(path.join(templateDir, `${name}.html`), result.html);
        });
    });
});
