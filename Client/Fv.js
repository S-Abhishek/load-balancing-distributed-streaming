const express = require('express')
const app = express()
const path=require('path')
const fs=require('fs')
const port = 3000
var ffmpeg=require('fluent-ffmpeg');
app.use(express.static(path.join(__dirname,'public')))
app.get('/video', function(req,res){
 	res.writeHead(206,{"Content-Type":"video/mp4"});
	var filePath = null;
	filePath     = "/home/abhi/Server/Videos/lwt1.mp4";
	
	var stat  = fs.statSync(filePath);
	
	var range        = req.headers.range;
	var parts        = range.replace(/bytes=/, "").split("-");
	var partialstart = parts[0];
	var partialend   = parts[1];
	
	var start     = parseInt(partialstart, 10);
	var end       = partialend ? parseInt(partialend, 10) : total-1;
	var chunksize = (end-start)+1;
	
	var file = fs.createReadStream(filePath, {start: start, end: end});
	
	res.writeHead(206, {
	 'Content-Range  ': 'bytes ' + start + '-' + end + '/' + total,
	 'Accept-Ranges'  : 'bytes',
	 'Content-Length' : chunksize,
	 'Content-Type'   : 'video/mp4'
	});
	
	ffmpeg(file)
	.videoCodec('libx264')
	.withAudioCodec('aac')
	.format('mp4')
	.videoFilters({
	 filter: 'drawtext',
	 options: {
	  fontsize:20,
	  fontfile: 'public/fonts/Roboto-Black.ttf',
	  text: "USERNAME",
	  x:10,
	  y:10,
	  fontcolor:"red"
	 }})
	 .outputOptions(['-frag_duration 100','-movflags frag_keyframe+faststart','-pix_fmt yuv420p'])
	 .output(res,{ end:true })
	 .on('error', function(err, stdout, stderr) {
	  console.log('an error happened: ' + err.message + stdout + stderr);
	 })
 	.run();


	
});

app.listen(port,'192.168.0.104',function(){
	console.log('App listening on port ${port}!')
});
