var MongoClient = require('mongodb').MongoClient;
const state={
    db:null
}

module.exports.connect=function(done){
    // const url = 'mongodb+srv://nikhil12:MGseWcRiY3TB50uh@cluster0.eol12r3.mongodb.net/'
     const url = 'mongodb://127.0.0.1:27017'
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