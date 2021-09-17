import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import pkg from './package.json';

const banner = `
/**
 * @license
 * author: ${pkg.author}
 * ${pkg.name} v${pkg.version}
 * (c) 2021-${new Date().getFullYear()}
 * Released under the ${pkg.license} license.
 */
`;

/** @type {import('rollup').RollupOptions} */
const rollupConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'commonjs',
      exports: 'default',
      banner,
    },
    // .mjs 会给大部份使用者带来困扰
    // {
    //   file: pkg.module,
    //   format: 'esm',
    //   exports: 'default',
    //   banner,
    // }
  ],
  plugins: [
    // 导入 node_modules 
    resolve(),
    // convert CommonJS modules to ES6,
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      module: 'es6',
      declarationDir: 'typings'
    }),
    json(),
  ],
  external: Object.keys(pkg.dependencies)
};

export default rollupConfig;
