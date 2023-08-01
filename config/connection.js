var MongoClient = require('mongodb').MongoClient;
const state={
    db:null
}

module.exports.connect=function(done){
   const url = 'mongodb+srv://nikhil:hWPARxzNX6MYsfEJ@cluster0.nh8p3ic.mongodb.net/'
   //const url = 'mongodb://127.0.0.1:27017'
    const dbname ='shopping'

    MongoClient.connect(url, (err,data)=>{
    if(err) return done(err)
    state.db=data.db(dbname)
    done()
    })
}

module.exports.get=function(){
    return state.db
}