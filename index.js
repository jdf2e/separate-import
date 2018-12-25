const {join} = require('path');
const t = require('babel-types');

const isLocaleExtra = curr => ~['locale', 'i18n'].indexOf(curr);
const isExportFuncExtra = curr => ~['dialog', 'toast', 'flex'].indexOf(curr);

function genImportDeclaration(specifiers = [], opts) {
    const packagesPath = `${opts.libraryName}/${opts.libraryDirectory}/`;
    return specifiers.reduce(function(newSpecifiers, curr) {
        const isLocale = isLocaleExtra(curr);
        const isExportFunc = isExportFuncExtra(curr);
        const target = `${packagesPath + curr}/${curr}`;
        const localePath = join(packagesPath, '..', 'locale');
        const {style} = opts;
        const importLocal = t.identifier(curr);
        const importDefault = t.importDefaultSpecifier(importLocal);
        const imported = t.importSpecifier(importLocal, importLocal);
        const imports = [
            t.importDeclaration([
                isLocale? imported: importDefault
            ], t.stringLiteral(isLocale? localePath: isExportFunc? `${packagesPath}/${curr}/_${curr}.js`: `${target.toLowerCase()}.vue`))
        ]
        if(style && !isLocale) {
            imports.push(t.importDeclaration([], t.stringLiteral(`${target.toLowerCase()}.${style}`)))
        }
        return newSpecifiers.concat(imports);
    }, []);
}

module.exports = function() {

    return {
        visitor: {
            ImportDeclaration(path, {opts = {}}) {
                if(!opts.libraryName) opts.libraryName = '@nutui/nutui2';
                if(!opts.libraryDirectory) opts.libraryDirectory = 'dist/src/packages';
                const {style} = opts;
                if(style) opts.style = style === 'scss'? 'scss': 'css';
                
                const {node} = path;
                if(!node.source) return;
                const {value} = node.source;
                const {specifiers} = node;
                if(value === opts.libraryName && specifiers && specifiers.length) {
                    const spes = specifiers.filter(specifier => specifier.type === 'ImportSpecifier').map(specifier => specifier.local.name);
                    if(spes.length) {
                        path.replaceWithMultiple(genImportDeclaration(spes, opts))
                    }
                }
            }
        }
    }
}

