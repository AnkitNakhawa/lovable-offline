import Handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as path from 'path';

export function renderTemplate(templateName: string, context: any): string {
    const templatePath = resolveTemplatePath(templateName);
    const content = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(content);
    return template(context);
}

function resolveTemplatePath(name: string): string {
    // adding template paths for root + base 
    const rootTemplates = path.resolve(__dirname, '../../../templates');
    const baseTemplates = path.join(rootTemplates, 'base');

    let attempt = path.join(baseTemplates, name);
    if (fs.existsSync(attempt)) return attempt;

    const dirs = ['app'];
    for (const d of dirs) {
        attempt = path.join(baseTemplates, d, name);
        if (fs.existsSync(attempt)) return attempt;
    }

    throw new Error(`Template not found: ${name} (looked in ${baseTemplates})`);
}
