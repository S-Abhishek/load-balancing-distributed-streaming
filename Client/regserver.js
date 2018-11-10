const express = require("express")
const app=express()
const port = 8080
const fs=require('fs')
const path=require('path')
const server_address = '/tmp/reqnum';
const net = require('net');

var reqnum = 0;

fs.unlink(server_address, ()=>{
    console.log("Unlinked");
});

const reqServer = net.createServer((socket) => {
  }).on('error', (err) => {
    // handle errors here
    throw err;
  }).on('connection', (socket) => {
      console.log("Unix Socket for req Connected")
      socket.on('data', (data) => {
            //load_data = decoder.write(data).split(",").map(parseFloat);
			//load_data = JSON.parse(decoder.write(data))
			console.log("recieved request for reqnum sending ",reqnum);
			socket.write(reqnum.toString());
			reqnum = 0;
      });
  });

reqServer.listen( server_address , () => {
    console.log('reqServer bound');
});


app.get('/watch',function(req,res){

	reqnum += 1;
	vid=req.query.vid;
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