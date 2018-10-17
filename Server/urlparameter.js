const express = require("express")
const app=express()
const port = 3000
const fs=require('fs')
const path=require('path')
const client=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectID;

	client.connect("mongodb://localhost:27017/youtube",function(err,db)
	{
		load_data={"ip1":1}
		threshold={"ip1":2}
		 var video_location=db.db("youtube");
		
		
		var lcq="location.India";
		
		console.log("here");
		var query={"_id" :ObjectId("5bc76596121ead5cea907ea2"),[lcq]:{$exists:true}};
		video_location.collection("videoloc").find(query,{[lcq]:1,_id:0}).toArray(function(err,result)
		{
			if(err)
				throw err;
			if(result.length==0)
			{
			}
			else
			{
				list_available_loc=result[0].location;
				console.log(list_available_loc);
				//console.log(result[0].location);
				//var key in list_available_loc
				//var value=list_available_loc[key];
				//console.log(key,value);
			}
			
			db.close();
		});
		var reg={};
		//var ip=bestregionalserver(reg)
		//ip=ip+"?id=",id+"&qty="+qty;
		//res.redirect(ip)
				
	});


app.get('/watch',function(req,res){
	var list_available_loc;
	id=req.query.id.toString();
	qty=req.query.qty;
	reg=req.query.reg;
	console.log(id,qty);
	client.connect("mongodb://localhost:27017/youtube",function(err,db)
	{
		load_data={"ip1":1}
		threshold={"ip1":2}
		 var video_location=db.db("youtube");
		//var query= {"_id" :ObjectId(id),"Location.};
		video_location.collection("videoloc").find(query).toArray(function(err,result)
		{
			if(err)
				throw err;
			list_available_loc=result[0].location;
			console.log(result[0].location);
			
			db.close();
		});
		var reg={};
		var ip=bestregionalserver(reg)
		ip=ip+"?id=",id+"&qty="+qty;
		res.redirect(ip)
				
	});
	
	
	console.log(list_available_loc);


});

app.listen(port,'192.168.0.105',function(){
	console.log('App listening')
});