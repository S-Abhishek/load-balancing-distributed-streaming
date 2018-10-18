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

const port = 3000
const central_server_ip = '10.0.2.13';
const server_address = '/tmp/loads';


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



function findMin(list_available_loc)
{
	var min = 100;
	var min_ip = central_server_ip;
	for(var region in list_available_loc)
	{ 
        console.log(region)
		for(var ip in list_available_loc[region])
		{
			if(load_data[list_available_loc[region][ip]] < threshold_data[list_available_loc[region][ip]]["grade_s"])
			{
				if(load_data[list_available_loc[region][ip]] < min)
				{
					min = load_data[list_available_loc[region][ip]]
					min_ip = list_available_loc[region][ip]

				}	 
			} 
		}
	}
	return min_ip
}

app.get('/watch',function(req,res){
    
    client.connect("mongodb://localhost:27017/Videodb",function(err,db)
    {
		
		if( Object.keys(req.query).length < 3)
		{
			res.write('Error')
			return;
		}
	
		id=req.query.id.toString();
   		qty=req.query.qty;
   	 	reg=req.query.reg.toString();

   	  	const video_location=db.db("Videodb");
   	 	var lcq="location.".concat(reg);
   	 
   	 	console.log("here",lcq);
   		const vidlocs = video_location.collection("vidlocs")
   	 	var query={"_id" :ObjectId("5bc8558e681ac8ae25b30e42"), [lcq] : {$exists : true} };
   	 	vidlocs.find(query).project({  [lcq] : 1, _id : 0} ).toArray(function(err,result)
   	 	{
			
   			if(err)
   				throw err;
			
			console.log(result)
			var min_ip
			var found = false
			if(result.length)
			{
				
				min_ip = findMin(result[0].location)
				if( min_ip != central_server_ip)
					found = true

			}

			if(!found)	
   		 	{
			var lc = "location"
            		var query1={ "_id" :ObjectId("5bc8558e681ac8ae25b30e42"), "location" : { $exists: true}  };
                	vidlocs.find(query1).project({"location" : 1, _id : 0}).toArray(function(err,result)
               		 {
					console.log(result)
					if(result.length)
					min_ip = findMin(result[0].location)
              		  });

   		 	}
			   
			console.log("Redirecting to " + min_ip)
			res.redirect("http://"+min_ip+"/watch?id="+id+"&qty="+qty);
			db.close();
		   
   	 	});
   			 
    });
});

app.listen(port, central_server_ip ,function(){
    console.log('App listening')
});


