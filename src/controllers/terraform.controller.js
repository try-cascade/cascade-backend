
const { spawn } = require("child_process");

function create(req, res) {
  const child = spawn('cdktf synth', {
    stdio: 'inherit',
    shell: true,
    cwd: '../cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "Successfully Built" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })
}

function deploy(req, res) {
  const child = spawn('cdktf deploy --auto-approve', { // add "*-stack"?
    stdio: 'inherit',
    shell: true,
    cwd: '../cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "infrastructure should now be seen in your AWS environment" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })
}

function uploadS3EnvironmentObject(req, res) {

}

module.exports = {
  create,
  deploy,
  uploadS3EnvironmentObject
}
