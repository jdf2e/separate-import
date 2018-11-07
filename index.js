
const t = require('babel-types');

function genImportDeclaration(specifiers = [], opts) {
    return specifiers.reduce(function(newSpecifiers, curr) {
        const target = `${opts.libraryName}/${opts.libraryDirectory}/${curr}/${curr}`;
        const {style} = opts;
        const imports = [
            t.importDeclaration([
                t.importDefaultSpecifier(t.identifier(curr))
            ], t.stringLiteral(`${target.toLowerCase()}.js`))
        ]
        if(style) {
            imports.push(t.importDeclaration([], t.stringLiteral(`${target.toLowerCase()}.${style}`)))
        }
        return newSpecifiers.concat(imports);
    }, []);
}

module.exports = function() {

    return {
        visitor: {
            ImportDeclaration(path, {opts = {}}) {
                if(!opts.libraryName) opts.libraryName = '@nutui/nutui';
                if(!opts.libraryDirectory) opts.libraryDirectory = 'dist/src/packages';
                const {style} = opts;
                if(style) opts.style = style === 'scss'? 'scss': 'css';
                
                const {node} = path;
                if(!node.source) return;
                const {value} = node.source;
                const {specifiers} = node;
                if(value === opts.libraryName && specifiers && specifiers.length) {
                    const spes = specifiers.map(specifier => specifier.local.name);
                    path.replaceWithMultiple(genImportDeclaration(spes, opts))
                }
            }
        }
    }
}