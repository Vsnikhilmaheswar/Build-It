
var db=require('../config/connection')
var collection=require('../config/collections');
const Collection = require('mongodb/lib/collection');
var objectId = require('mongodb').ObjectID
module.exports = {

    addproduct:(product,callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
           // console.log(data);
            callback(data.ops[0]._id)
        })
    },
    addcategory:(category,callback)=>{
        console.log(category);
        db.get().collection('category').insertOne(category).then((data) => {
            // console.log(data);
             callback(data.ops[0]._id)
         })
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    getcategories:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection('category').find().toArray()
            resolve(product)
        })
    },


    deleteWorker: (workerId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.WORKER_COLLECTION).deleteOne({ _id: objectId(workerId) })
            .then((response) => {
              resolve(response);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      ,
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    description:proDetails.description,
                    price:proDetails.price,
                    category:proDetails.category
                }
            }).then((product)=>{
              resolve()  
            })
        })
    },


    getAllUser:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    }
}