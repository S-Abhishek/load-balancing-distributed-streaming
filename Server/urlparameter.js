const express = require("express")
const app=express()
const port = 3000
const fs=require('fs')
const path=require('path')
const client=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectID;




app.get('/watch',function(req,res){
	var list_available_loc;
	id=req.query.id;
	qty=req.query.qty;
	console.log(id,qty);
	client.connect("mongodb://localhost:27017/youtube",function(err,db)
	{
		 var video_location=db.db("youtube");
		var query= {"_id" : ObjectId("5bc4bbc50b804a4b01065b1a")};
		video_location.collection("videoloc").find(query).toArray(function(err,result)
		{
			if(err)
				throw err;
			list_available_loc=result[0].location;
			console.log(list_available_loc,result[0].location);
			
			db.close();
		});
	});

	console.log(list_available_loc);


});

app.listen(port,'192.168.0.105',function(){
	console.log('App listening')
});