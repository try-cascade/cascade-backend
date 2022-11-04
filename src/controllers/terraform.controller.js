const { spawn } = require("child_process");

// const client = { stream: null } // res now accessible from /stream

// app.get('/stream', (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream')
//   res.setHeader('Connection', 'keep-alive')
//   res.setHeader('Cache-Control', 'no-cache')

//   client.stream = res // make res accessible
// })

// client.stream.write(`data: ${JSON.stringify(phoneBook)}\n\n`) // res open to frontend


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
  // const child = spawn('cdktf destroy "*-stack" --auto-approve', {
  //   stdio: 'inherit',
  //   shell: true,
  //   cwd: './cdktf'
  // });

  // child.on("close", (message) => {
  //   if (message === 0) {
  //     res.status(200).json({ message: "infrastructure should now be removed from your AWS environment" })
  //   } else {
  //     res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
  //   }
  // })
  res.writeHead(200, { "Content-Type": "text/event-stream",
                        "Connection": "keep-alive",
                        "Cache-control": "no-cache" });

  var spw = spawn('cdktf destroy "*-stack" --auto-approve', {
    stdio: ['inherit', 'pipe'],
    shell: true,
    cwd: './cdktf'
  })

  spw.stdout.on('data', function (data) {
    console.log("msg data");
    res.write('data: ' + data.toString() + "\n\n");
  });

  spw.on('exit', function (code) {
    res.write('event: close\ndata: finished \n\n');
    res.end('exited');
  });

  spw.stderr.on('data', function (data) {
      res.end('stderr: ' + data);
  });
}

function uploadS3EnvironmentObject(req, res) {

}

// dummy
function msg(req, res) {
  // res.writeHead(200, { "Content-Type": "text/event-stream",
  //                       "Connection": "keep-alive",
  //                       "Cache-control": "no-cache" });

   res.setHeader("Content-Type", "text/event-stream");
   res.setHeader("Connection", "keep-alive");
   res.setHeader("Cache-control", "no-cache");

  // res.connection.setTimeout(0);

  var spw = spawn('cdktf synth', { // deploy "*-stack" --auto-approve
    stdio: ['inherit', 'pipe'],
    shell: true,
    cwd: './cdktf'
  })
  // str = "";

  spw.stdout.on('data', function (data) {
      // str += data.toString();

      // just so we can see the server is doing something
      console.log("msg data");

      // Flush out line by line.
      // var lines = str.split("\n");
      // for(var i in lines) {
          // if(i == lines.length - 1) {
          //     str = lines[i];
          // } else{
              // Note: The double-newline is *required*
              res.write('data: ' + data.toString() + "\n\n");
          // }
      // }
  });

  spw.on('exit', function (code) {
      res.write('event: close\ndata: finished \n\n');
      // if (code === 0) { // we enter this block, but got Cannot set headers after they are sent to the client error; res.status must not work?
      //   res.status(200).json({ message: "infrastructure should now be seen in your AWS environment" })
      // } else {
      //   res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
      // }
      res.end('exited');
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
