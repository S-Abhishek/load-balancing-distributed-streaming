const express = require("express")
const app=express()
const fs=require('fs')
const path=require('path')
const { execFile } = require('child_process');
const client=require('mongodb').MongoClient;
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
const net = require('net');
const threshold_data = require("./threshold_info.json") 
var ObjectId=require('mongodb').ObjectID;
const ip_index = fs.readFileSync("./mfile", "utf8" ).split("\n");
const adj_data = require('./adj_data.json')
const port = 3000
const central_server_ip = '10.0.2.13';
const server_address = '/tmp/loads';
const HOT = 3

load_data = {}
console.log(threshold_data)

fs.unlink(server_address, ()=>{
    console.log("Unlinked");
});

const loadServer = net.createServer((socket) => {
    socket.end('goodbye\n');
  }).on('error', (err) => {
    // handle errors here
    throw err;
  }).on('connection', (socket) => {
      console.log("Unix Socket Connected")
      socket.on('data', (data) => {
            //load_data = decoder.write(data).split(",").map(parseFloat);
			load_data = JSON.parse(decoder.write(data))
			console.log("recieved",load_data);
      });
  });

loadServer.listen( server_address , () => {
    console.log('loadServer bound');
});


function RemoteCopy(to_ip, locations, name)
{	
	candidates = adj_data[to]
	locations.push(central_server_ip)

	for(i in candidates)
	{
  		if(!locations.includes(ip_index[i]) || candidates[i] == 0)
    		candidates[i] = Infinity 
	}
	
	min_dist = Math.min(...candidates)
	from_ip = ip_index[candidates.indexOf(min_dist)]
	console.log("Min dist",min_dist,"From ip", from_ip)
	
	arg1 = from_ip+":~/Videos/"+name+".mp4"
	arg2 = to_ip+":~/Videos"
	console.log("Copyting from " + from_ip + " to " + to_ip)
	const child = execFile("scp", [arg1,arg2] , (error, stdout, stderr) => {
	  if (error) {
	    throw error;
	  }
		console.log(stdout)
	});
}

function findMin(list_available_loc)
{
	var min = 100;
	var min_ip = central_server_ip;
	for(var region in list_available_loc)
	{ 
        console.log(region)
		ip = list_available_loc[region]
		if(load_data[ip] < threshold_data[ip]["grade_s"] && load_data[ip] < min)
		{
			min = load_data[ip]
			min_ip = ip
		} 
		
	}
	return min_ip
}



client.connect("mongodb://localhost:27017/VideoDB",function(err,db)
{
	console.log("Connected to DB")
	app.get('/watch',function(req,res)
	{
    	console.log("Request received")
		if( Object.keys(req.query).length < 2)
		{
			res.send('Error')
			return;
		}
	
		vid = req.query.vid.toString();
   	 	reg = req.query.reg.toString();

   	  	const VideoDB=db.db("VideoDB");
   	 
   	 	console.log("here",reg);
   		const vidlocs = VideoDB.collection("vidlocs")
   	 	var query = {"vid" :vid, "locations" : {$exists : true} };
   	 	vidlocs.find(query).project({ "locations" : 1, _id : 0} ).toArray(function(err,result)
   	 	{
   			if(err)
   				throw err;
			
			console.log(query,result)
			var min_ip = central_server_ip
			if(result.length)
			{
				const locations = result[0].locations
				console.log(load_data[locations[reg]],  threshold_data[locations[reg]])
				if(reg in locations && load_data[locations[reg]] < threshold_data[locations[reg]]["grade_s"] )
				{
					
					min_ip = locations[reg]
				} 
				else
				{
					min_ip = findMin(locations)
				}
			
			   
				console.log("Redirecting to " + min_ip)
				res.redirect("http://"+min_ip+":8080/watch?vid="+vid);

				if(!(reg in locations))
				{
					VideoDB.collection("hotinfo").findOneAndUpdate(
						{ "reg" : reg }, 
						{ $inc : { ["reg_movie_infor."+vid] : 1 } },
						{
							upsert:true,
							returnNewDocument: true
						},
						function( err, result)
						{
							if(err)
								throw err;
				
							if( result )
							{
								if( result["value"]["reg_movie_infor"][vid] >= HOT )
									{
										reg_ip = result["value"]["ip"]
										RemoteCopy( reg_ip, Object.values(locations), vid )
										vidlocs.findOneAndUpdate(
											{  "vid" : vid },
											{ $set :  { ["locations."+reg] : reg_ip } },
											{
												upsert:true,
											},function(err, result){
												if(err)
													throw(err)
												else
													console.log("Updated vidloc")
											})
									}
							}
						}
					)
				}
			}
			else
			{
				res.send("Video not Found")
				return;
			}
			
			//db.close();	   
   	 	});
   			 
    });
});

app.listen(port, central_server_ip ,function(){
    console.log('App listening')
});





