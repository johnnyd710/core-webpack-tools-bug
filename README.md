# core-webpack-tools-bug
Reproduction of a bug

1. pnpm i
2. pnpm build
3. look at the [sourcemap](out/index.js.map) file (copied below). The "sources" field is wrong, it does not match the [sourcemap specification](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#heading=h.mofvlxcwqzej). You will get an error if you try to use this sourcemap with a tool that follows the spec (like vscode).
```json
{
  "version":3,
  "file":"index.js",
  "mappings":";;;;;;;;;AAAA,SAAgB,KAAK;IACnB,OAAO,eAAe,CAAC;AACzB,CAAC;AAFD,sBAEC;AAED,OAAO,CAAC,GAAG,CAAC,KAAK,EAAE,CAAC,CAAC",
  "sources":
  [
    {
      "identifier":"./src/index.ts",
      "shortIdentifier":"./src/index.ts",
      "resource":"./src/index.ts",
      "resourcePath":"./src/index.ts","absoluteResourcePath":"C:\\Users\\John.DiMatteo\\repos\\core-webpack-tools-bug\\src\\index.ts",
      "loaders":"",
      "allLoaders":"",
      "query":"",
      "moduleId":"",
      "hash":"ffb4",
      "namespace":"sourcemaps-app"
      }],
      "sourcesContent":
      [
        "export function hello() {\n  return 'Hello, world!';\n}\n\nconsole.log(hello());"
      ],
    "names":[],
    "sourceRoot":""
  }
```

## Suspected cause

`compiler.options.output.devtoolModuleFilenameTemplate` is modified by the BackendDefaultsPlugin.js file in `@itwin/core-webpack-tools`:
```js
compiler.options.output.devtoolModuleFilenameTemplate = (value, options) => {
    if (value)
        return value;
    if (isProductionLikeMode(options))
        return (info) => path
            .relative(options.output?.path || process.cwd(), info.absoluteResourcePath)
            .replace(/\\/g, "/");
    return (info) => info.absoluteResourcePath.replace(/\\/g, "/");
};
```

The lines 
```js
if (value)
    return value;
```
return the [value function parameter object](https://webpack.js.org/configuration/output/#outputdevtoolmodulefilenametemplate) as-is, which is not a valid return type according to the sourcemap spec.

