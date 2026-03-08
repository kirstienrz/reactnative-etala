const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const files = glob.sync('c:/Users/Win10/Desktop/reactnative-etala/web/src/pages/**/*.{jsx,js}');

let updatedCount = 0;

for (const file of files) {
    let code = fs.readFileSync(file, 'utf8');
    let ast;

    try {
        ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx']
        });
    } catch (err) {
        console.error(`Error parsing ${file}:`, err);
        continue;
    }

    let modified = false;

    traverse(ast, {
        JSXElement(path) {
            const { openingElement } = path.node;

            // Look for `<input ... />`
            if (openingElement.name.name === 'input') {
                const isFile = openingElement.attributes.some(attr =>
                    attr.name?.name === 'type' && attr.value?.value === 'file'
                );
                const isHidden = openingElement.attributes.some(attr =>
                    attr.name?.name === 'className' && attr.value?.value?.includes('hidden')
                );

                if (isFile && isHidden) {
                    // Change className="hidden" to className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                    openingElement.attributes.forEach(attr => {
                        if (attr.name?.name === 'className') {
                            attr.value.value = "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50";
                        }
                    });

                    // Also, we need to make sure the parent container has `relative` to contain the absolute positioned input
                    // Let's go up the AST to the closest JSXElement with a className and prepend 'relative overflow-hidden '
                    let parentPath = path.parentPath;
                    while (parentPath && parentPath.node.type !== 'JSXElement') {
                        parentPath = parentPath.parentPath;
                    }
                    if (parentPath && parentPath.node.type === 'JSXElement') {
                        const parentOpeningElement = parentPath.node.openingElement;
                        const classAttr = parentOpeningElement.attributes.find(attr => attr.name?.name === 'className');
                        if (classAttr && classAttr.value && classAttr.value.type === 'StringLiteral') {
                            if (!classAttr.value.value.includes('relative')) {
                                classAttr.value.value = 'relative overflow-hidden ' + classAttr.value.value;
                            }
                        }
                    }

                    modified = true;
                }
            }
        }
    });

    if (modified) {
        const output = generate(ast, {}, code);
        fs.writeFileSync(file, output.code, 'utf8');
        updatedCount++;
        console.log(`Updated ${file}`);
    }
}

console.log(`Total files updated: ${updatedCount}`);
