
var db=require('../config/connection')
var collection=require('../config/collections');
const Collection = require('mongodb/lib/collection');
var objectId = require('mongodb').ObjectID
module.exports = {

    addproduct:(product,callback) => {
        console.log(product);
        db.get().collection('worker').insertOne(product).then((data) => {
           // console.log(data);
            callback(data.ops[0]._id)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.WORKER_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WORKER_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WORKER_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    fName:proDetails.fName,
                    lName:proDetails.lName,
                    jobLocation:proDetails.jobLocation,
                    address:proDetails.address,
                    YOE:proDetails.YOE,
                    qualification:proDetails.qualification,
                    email:proDetails.email,
                    phone:proDetails.phone,
                    additionalinfo:proDetails.additionalinfo
                }
            }).then((product)=>{
              resolve()  
            })
        })
    }, 
    deleteWorker: (workerId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.WORKER_COLLECTION).deleteOne({ _id: objectId(workerId) })
            .then((result) => {
              resolve(result.deletedCount);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      
}