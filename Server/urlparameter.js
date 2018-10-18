const express = require("express")
const app=express()
const port = 3000
const fs=require('fs')
const path=require('path')
const client=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectID;

	


app.get('/watch',function(req,res){
	
	client.connect("mongodb://localhost:27017/youtube",function(err,db)
	{
		var list_available_loc;
		id=req.query.id.toString();
		qty=req.query.qty;
		reg=req.query.reg.toString();
		console.log(id,qty,reg);
		load_data={"ip1":1}
		threshold={"ip1":2}
		 var video_location=db.db("youtube");
		
		console.log(id,qty,reg);
		var lcq="location.".concat(reg);
		
		console.log("here",lcq);
		
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
				
				for(var key in list_available_loc)
				{
					for(var value in list_available_loc[key])
						console.log(list_available_loc[key][value]);
				}
				//console.log(key,value);
			}
			
			db.close();
		});
		var reg={};
		//var ip=bestregionalserver(reg)
		//ip=ip+"?id=",id+"&qty="+qty;
		//res.redirect(ip)
				
	});
	
	
	


});

app.listen(port,'192.168.0.102',function(){
	console.log('App listening')
});