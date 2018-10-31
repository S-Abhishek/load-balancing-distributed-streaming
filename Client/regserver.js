const express = require("express")
const app=express()
const port = 8080
const fs=require('fs')
const path=require('path')



app.get('/watch',function(req,res){

	vid=req.query.id;
	const path="/home/mpiuser/Videos/"+ vid +".mp4"
	console.log("Video requested :" + path);
	if(!fs.existsSync(path))
	{
		res.send('Video not Found')
		return;
	}

	const stat=fs.statSync(path)
	const fileSize=stat.size
	const range=req.headers.range

	if(range)
	{
		var seg= range.replace(/bytes=/, "").split("-")
		var start=parseInt(seg[0],10)
		var end=seg[1]
			? parseInt(seg[1],10)
			:fileSize-1

		var chunk=(end-start)+1
		var file=fs.createReadStream(path,{start,end})
		console.log(chunk)

		var head = {
		      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
		      'Accept-Ranges': 'bytes',
		      'Content-Length': chunk,
		      'Content-Type': 'video/mp4',
  		}

		console.log(head)
		res.writeHead(206,head)	
		file.pipe(res)

	}

	else

	{

		console.log("No range");
		const head = {
			'Content-Length':fileSize,
			'Content-Type':'video/mp4',
		}

		res.writeHead(200,head)
		fs.createReadStream(path).pipe(res)

	}

})



app.listen(port,function(){
	console.log('App listening')

});