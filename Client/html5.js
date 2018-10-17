const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()



app.get('/video', function(req, res) {
  const path = 'Videos/lwt1.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    var seg = range.replace(/bytes=/, "").split("-")
    var start = parseInt(seg[0], 10)
    var end = seg[1]
      ? parseInt(seg[1], 10)
      : fileSize-1

    var chunksize = (end-start)+1
    var file = fs.createReadStream(path, {start, end})
    var head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(3000, "192.168.0.104",function () {
  console.log('Listening on port 3000!')
})