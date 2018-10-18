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
   	 load_data={"ip1":1,"ip2":2,"ip3":3,"ip4":4,"ip5":5,"ip6":6}
   	 threshold={"ip1":6,"ip2":6,"ip3":6,"ip4":5,"ip5":4,"ip6":6}
   	  var video_location=db.db("youtube");
   	 
   	 console.log(id,qty,reg);
   	 var lcq="location.".concat(reg);
         var lc="location";
   	 
   	 console.log("here",lcq);
   	 
   	 var query={"_id" :ObjectId("5bc8399973b88dc0c4f952cb"),[lcq]:{$exists:true}};
   	 video_location.collection("videoloc").find(query,{[lcq]:1,_id:0}).toArray(function(err,result)
   	 {
   		 if(err)
   			 throw err;
   		 if(result.length==0)
   		 {
                var query1={"_id" :ObjectId("5bc8399973b88dc0c4f952cb"),[lc]:{$exists:true}};
                video_location.collection("videoloc").find(query,{[lc]:1,_id:0}).toArray(function(err,result)
                {
			var c=0;
                     for(var key in list_available_loc)
                    {
                        
                        for(var value in list_available_loc[key])
                        {
                            if(load_data[list_available_loc[key][value]]<threshold[list_available_loc[key][value]])
                            {
                                if(c==0)
                                {
                                    min=load_data[list_available_loc[key][value]];   	 
					c=1;
					min_ip=list_available_loc[key][value];
                                }
                                else
                                {
                                    if(min>load_data[list_available_loc[key][value]])
                                    {
                                        min=load_data[list_available_loc[key][value]]
                                        min_ip=list_available_loc[key][value]

                                    }


                                }

                                    
                            }
                            
                            
                        }
                    }
			 console.log(min_ip,min);
                    min_ip=min_ip+"/watch?id="+id+"&qty="+qty;
                    res.redirect(min_ip);

                });

   		 }
   		 else
   		 {
   			 list_available_loc=result[0].location;
   			 console.log(list_available_loc);
   			 //console.log(result[0].location);
   			 
             var min=0;
             var min_ip;
		var c=0;
   			 for(var key in list_available_loc)
   			 {
   				 
   				 for(var value in list_available_loc[key])
   				 {
   					 if(load_data[list_available_loc[key][value]]<threshold[list_available_loc[key][value]])
   					 {
   						 if(c==0)
   						 {
   							min=load_data[list_available_loc[key][value]];   
							min_ip=list_available_loc[key][value];
							c=1;	 
   						 }
                        else
                        {
                            if(min>load_data[list_available_loc[key][value]])
                            {
                                min=load_data[list_available_loc[key][value]]
                                min_ip=list_available_loc[key][value]

                            }


                        }

   							 
   					 }
   					 
   					 //console.log(list_available_loc[key][value]);
   				 }
   			 }
   			 console.log(min_ip,min);
            min_ip=min_ip+"/watch?id="+id+"&qty="+qty;
            res.redirect(min_ip);
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


