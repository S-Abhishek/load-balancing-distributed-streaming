const express = require('express')
const app = express()
const path=require('path')
const fs=require('fs')
const port = 3000
var ffmpeg=require('fluent-ffmpeg');
app.use(express.static(path.join(__dirname,'public')))
app.get('/video', function(req,res){
 	res.writeHead(206,{"Content-Type":"video/mp4"});
	var location="/Videos/lwt1.mp4";
	var outStream=fs.createWriteStream(__dirname+"/Videos/lwt1.mp4");
	ffmpeg(location)
	.audioCodec('libmp3lame')
	.videoCodec('libx264')
	.addOption('-strict','experimental')
	.addOption('-movflags','faststart')
	.size('640x480').autopad()
	.on('start',function(){
		console.log("Started");
	})
	.on("end",function(){
		console.log("Finished");
	})
	.on('error',function(err,stdout,stderr)
	{	
		console.log('Error:'+err.message);
		console.log('ffmpeg stdout:'+stdout);
		console.log('ffmpeg stderr:'+stderr);
	})
	.pipe(outStream,{end:true});


	
});

app.listen(port,'192.168.0.104',function(){
	console.log('App listening on port ${port}!')
});
