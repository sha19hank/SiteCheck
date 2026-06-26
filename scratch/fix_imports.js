const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/KIIT0001/Documents/Projects/sitecheck-v1/sitecheck/lib/audit/category-audits';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/CategoryFinding/g, 'CanonicalFinding');
    fs.writeFileSync(filePath, content);
  }
}

const consultantEnginePath = 'c:/Users/KIIT0001/Documents/Projects/sitecheck-v1/sitecheck/lib/audit/consultant-engine/index.ts';
let ceContent = fs.readFileSync(consultantEnginePath, 'utf8');
ceContent = ceContent.replace(/CategoryFinding/g, 'CanonicalFinding');
fs.writeFileSync(consultantEnginePath, ceContent);

const growthEnginePath = 'c:/Users/KIIT0001/Documents/Projects/sitecheck-v1/sitecheck/lib/audit/growth-engine/index.ts';
let geContent = fs.readFileSync(growthEnginePath, 'utf8');
geContent = geContent.replace(/CategoryFinding/g, 'CanonicalFinding');
fs.writeFileSync(growthEnginePath, geContent);
