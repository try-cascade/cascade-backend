const { spawn } = require("child_process");

function create(req, res) {
  const child = spawn('cdktf synth', {
    stdio: 'inherit',
    shell: true,
    cwd: './cdktf'
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
  res.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-control": "no-cache" });

  const child = spawn('cdktf deploy "*-stack" --auto-approve', {
    stdio: ['inherit', 'pipe'],
    shell: true,
    cwd: './cdktf'
  });

  let str = '';

  child.stdout.on('data', (data) => {
    str += data.toString();

    // just so we can see the server is doing something
    console.log("data here");

    // Flush out line by line.
    var lines = str.split("\n");
    for(var i in lines) {
      if(i == lines.length - 1) {
        str = lines[i];
      } else {
        // Note: The double-newline is *required*
        res.write('data: ' + lines[i] + "\n\n");
      }
    }
  }) // keep the connection open between backend and frontend

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "infrastructure should now be seen in your AWS environment" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })

  child.stderr.on('data', function (data) {
    res.end('stderr: ' + data);
  });
}

// how do we abort? (ctrl + C equiv)
// function abort(req, res) {
//   const child = spawn('', {
//     stdio: 'inherit',
//     shell: true,
//     cwd: './cdktf'
//   });

//   child.on("close", (message) => {
//     if (message === 0) {
//       res.status(200).json({ message: "infrastructure should now be removed from your AWS environment" })
//     } else {
//       res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
//     }
//   })
// }

function destroy(req, res) {
  const child = spawn('cdktf destroy "*-stack" --auto-approve', {
    stdio: 'inherit',
    shell: true,
    cwd: './cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "infrastructure should now be removed from your AWS environment" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })
}

function uploadS3EnvironmentObject(req, res) {

}

function msg(req, res) {
  res.writeHead(200, { "Content-Type": "text/event-stream",
                        "Cache-control": "no-cache" });

  var spw = spawn('cdktf deploy env-stack --auto-approve', { // env-stack only (change this back to all stacks)
    stdio: ['inherit', 'pipe'],
    shell: true,
    cwd: './cdktf'
  }),
  str = "";

  spw.stdout.on('data', function (data) {
      str += data.toString();

      // just so we can see the server is doing something
      console.log("data");

      // Flush out line by line.
      var lines = str.split("\n");
      for(var i in lines) {
          if(i == lines.length - 1) {
              str = lines[i];
          } else{
              // Note: The double-newline is *required*
              res.write('data: ' + lines[i] + "\n\n");
          }
      }
  });

  spw.on('close', function (code) {
      res.end(str);
  });

  spw.stderr.on('data', function (data) {
      res.end('stderr: ' + data);
  });
}

module.exports = {
  create,
  deploy,
  destroy,
  uploadS3EnvironmentObject,
  msg
}
