
var db=require('../config/connection')
var collection=require('../config/collections');
const Collection = require('mongodb/lib/collection');
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt');
module.exports = {

  addproduct: (contractorId, workerData, callback) => {
    const worker = {
      fName: workerData.fName,
      lName: workerData.lName,
      jobLocation: workerData.jobLocation,
      address: workerData.address,
      YOE: workerData.YOE,
      qualification: workerData.qualification,
      email: workerData.email,
      Phone: workerData.Phone,
      additionalinfo: workerData.additionalinfo,
      contractorId: contractorId,
      flag: false // Set the default value of flag to false
    };
  
    db.get().collection('worker').insertOne(worker).then((data) => {
      callback(data.ops[0]._id);
    });
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
      },
      
      //contrtactors      
      doConSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
          try {
            userData.Password = await bcrypt.hash(userData.Password, 10);
            db.get().collection('contractor').insertOne(userData).then((data) => {
              resolve(data.ops[0]);
            });
          } catch (err) {
            reject(err);
          }
        });
      },
      doCLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
          let loginStatus = false
          let response = {}
          let admin = await db.get().collection('contractor').findOne({ email: userData.email })
          if (admin) {
            bcrypt.compare(userData.Password, admin.Password).then((status) => {
              if (status) {
                console.log("admin login success");
                response.admin = admin
                response.status = true
                resolve(response)
              } else {
                console.log("login failed");
                resolve({ status: false })
              }
    
            })
          } else {
            console.log("login failed");
            resolve({ status: false })
    
          }
        })
      },

      getMyWorker: (contractorId) => {
        return new Promise(async (resolve, reject) => {
          let products = await db.get().collection(collection.WORKER_COLLECTION).find({ contractorId: contractorId }).toArray();
          resolve(products);
        });
      },

      updateFlag: (contractorId, workerId, flag) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.WORKER_COLLECTION)
            .updateOne(
              { _id: objectId(workerId), contractorId: contractorId },
              { $set: { flag: flag } }
            )
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
      storereq: (requestData, callback) => {
        // Perform the necessary operations to store the request data in the database
        // Example: Assuming you have a collection named 'reqDetails'
        db.get().collection('reqDetails').insertOne(requestData)
          .then(() => {
            callback(true); // Invoke the callback with status true if storing is successful
          })
          .catch((error) => {
            console.error(error);
            callback(false); // Invoke the callback with status false if storing fails
          });
      },
      
      
}