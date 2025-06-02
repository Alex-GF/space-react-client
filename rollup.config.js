import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.js', format: 'esm' }],
    external: ['react', 'react-dom'],
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  {
    input: 'dist/types.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  }
];