const express = require("express")
const app=express()
const port = 3000
const fs=require('fs')
const path=require('path')
const client=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectID;




app.get('/watch',function(req,res){
	var list_available_loc;
	id=req.query.id.toString();
	qty=req.query.qty;
	reg=req.query.reg;
	console.log(id,qty);
	client.connect("mongodb://localhost:27017/youtube",function(err,db)
	{
		 var video_location=db.db("youtube");
		var query= {"_id" :ObjectId(id)};
		video_location.collection("videoloc").find(query).toArray(function(err,result)
		{
			if(err)
				throw err;
			list_available_loc=result[0].reg;
			console.log(list_available_loc,result[0].location);
			
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