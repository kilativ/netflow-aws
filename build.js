let shell = require('shelljs')
let fs = require('fs')
let buildDir = 'build'

if (fs.existsSync(buildDir)) {
    shell.rm("-rf", buildDir)
}
shell.cp("-R", "server/build", buildDir)
shell.cp("server/.env", buildDir)
shell.cp("-R", "client/dist/*", buildDir)