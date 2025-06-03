import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { resolve } from 'path';

export default [
  {
    input: 'src/main/index.ts',
    output: [{ file: 'dist/index.js', format: 'es' }],
    external: ['react', 'react-dom'],
    plugins: [
      alias({
        entries: [{ find: '@', replacement: resolve(process.cwd(), 'src/main') }],
      }),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  {
    input: 'src/main/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      alias({
        entries: [{ find: '@', replacement: resolve(process.cwd(), 'src/main') }],
      }),
      dts(),
    ],
  },
];
