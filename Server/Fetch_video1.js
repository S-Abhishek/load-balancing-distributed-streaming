const express = require('express')
const app = express()
const port = 3000

app.get('/', function(req,res){
 	res.send("Hello World!")
});

app.listen(port,'192.168.0.104',function(){
	console.log('App listening on port ${port}!')
});

const http = require('http');
const express= require('express');
const fs=require('fs');
const app=express()
var mpegcommand= require('fluent-ffmpeg');
var cmd= new mpegcommand();

const hostname = '192.168.0.104';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  cmd.input('Videos/lwt1.mp4').inputFPS(30).output('Videos/lwt1.mp4').outputFPS(30).noAudio().run();
	
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  	
	console.log(`Server running at http://${hostname}:${port}/`);
});
