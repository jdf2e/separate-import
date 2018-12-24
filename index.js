const {join} = require('path');
const t = require('babel-types');

const isLocaleExtra = curr => ~['locale', 'i18n'].indexOf(curr);
const isExportFuncExtra = curr => ~['dialog', 'toast'].indexOf(curr);

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

module.exports = function({types: t}) {

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
                    const spes = specifiers.map(specifier => specifier.local.name);
                    path.replaceWithMultiple(genImportDeclaration(spes, opts))
                }
            }
        }
    }
}

/**
 * 让用户指定按需加载css还是scss并不重要，可以不支持
 * 如果用户还可以指定按需加载css还是scss的话，当指向 index.js 时，其中的 import './*.scss'，如果不删除会造成重复加载scss的问题，需要ast删除，并且存在webpack版本问题
 * 指向.vue的话，用户可以指定按需加载css还是scss，但是dialog和toast需单独处理，该方式改动最小，只需加一个中间性质的js导出，index.js再导出
 *  */