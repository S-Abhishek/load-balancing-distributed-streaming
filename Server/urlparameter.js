const express = require("express")
const app=express()
const fs=require('fs')
const path=require('path')
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
      });
  });

loadServer.listen( server_address , () => {
    console.log('loadServer bound');
});


void RemoteCopy(to, locations, name, qty)
{	
	candidates = adj_data[to]
	var min_dist = Math.min(...candidates.filter(Boolean).filter(
		function(e){
			return  locations.includes(ip_index[candidates.indexOf(e)]);
			
		},
	))
	
	var min_ip_index  = adj_data[to].indexOf(min_dist)
	var from = ip_index[min_ip_index]
	console.log(min_dist,min_ip_index,from)
	
	arg1 = from+":~/Videos/"+name+qty+".mp4"
	arg2 = to+":~/Videos"
	console.log("Copyting from " + from + " to " +to)
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
		if( Object.keys(req.query).length < 3)
		{
			res.send('Error')
			return;
		}
	
		id=req.query.id.toString();
   		qty=req.query.qty;
   	 	reg=req.query.reg.toString();

   	  	const VideoDB=db.db("VideoDB");
   	 
   	 	console.log("here",reg);
   		const vidlocs = VideoDB.collection("vidlocs")
   	 	var query={"_id" :ObjectId(id), "locations" : {$exists : true} };
   	 	vidlocs.find(query).project({ "locations" : 1, _id : 0} ).toArray(function(err,result)
   	 	{
			
   			if(err)
   				throw err;
			
			console.log(query,result)
			var min_ip = central_server_ip
			if(result.length)
			{
				const locations = result[0].locations
				if(reg in locations && load_data[locations[reg]] < threshold_data[locations[reg]] )
				{
					min_ip = locations[reg]
				} 
				else
				{
					min_ip = findMin(locations)
				}
			
			   
				console.log("Redirecting to " + min_ip)
				res.redirect("http://"+min_ip+"/watch?id="+id+"&qty="+qty);

				if(!(reg in locations))
				{
					VideoDB.collection("hotinfo").findOneAndUpdate(
						{ "reg" : reg }, 
						{ $inc : { ["reg_movie_infor."+id] : 1 } },
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
								if( result["value"]["reg_movie_infor"][id] >= HOT )
									{
										reg_ip = result["value"]["ip"]
										console.log("copy dude to "+reg_ip)
										RemoteCopy( reg_ip, Object.values(locations), id, qty )
										vidlocs.findOneAndUpdate(
											{  _id : ObjectId(id) },
											{ $set :  { ["locations."+reg] : reg_ip } },
											{
												upsert:true,
											},function(err, result){
												console.log("Updated vidloc "+err)
											})
									}
							}
						}
					)
				}
			}
			
			//db.close();	   
   	 	});
   			 
    });
});

app.listen(port, central_server_ip ,function(){
    console.log('App listening')
});





