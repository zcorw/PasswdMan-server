import { readFileSync, accessSync, constants, writeFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { generateKeyAndIv } from 'src/common/utils/generateKey';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

const env = process.env.NODE_ENV;

console.log(env);

function readKey() {
  try {
    accessSync(join(__dirname, `../../config/crypto.yml`), constants.R_OK);
    return yaml.load(
      readFileSync(join(__dirname, `../../config/crypto.yml`), 'utf8'),
    ) as Record<string, any>;
  } catch (e) {
    const data = generateKeyAndIv();
    writeFileSync(join(__dirname, `../../config/crypto.yml`), yaml.dump(data));
    return data;
  }
}

export default () => {
  const config = yaml.load(
    readFileSync(
      join(__dirname, `../../config/${configFileNameObj[env]}.yml`),
      'utf8',
    ),
  ) as Record<string, any>;
  const crypto = readKey();

  return {
    ...config,
    crypto,
  };
};
