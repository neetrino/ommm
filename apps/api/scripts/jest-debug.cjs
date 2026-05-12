'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const apiRoot = path.join(__dirname, '..');
const jestBin = require.resolve('jest/bin/jest', { paths: [apiRoot] });

const result = spawnSync(
  process.execPath,
  [
    '--inspect-brk',
    '-r',
    'tsconfig-paths/register',
    '-r',
    'ts-node/register',
    jestBin,
    '--runInBand',
  ],
  { stdio: 'inherit', cwd: apiRoot },
);

process.exit(result.status ?? 1);
