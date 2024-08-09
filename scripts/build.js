const shell = require('shelljs');

// 定义要执行的命令
const command1 = 'nest build';
const command2 = 'node dist/main';


if (shell.exec(command1, { silent: false }).code !== 0) {
  shell.echo('Error: nest build failed');
  shell.exit(1);
}
// 执行第二个命令并检查是否成功
if (shell.exec(command2).code !== 0) {
  shell.echo('Error: cross-env NODE_ENV=production node dist/main failed');
  shell.exit(1);
}