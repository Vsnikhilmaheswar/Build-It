var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
var objectId = require('mongodb').ObjectID
const Razorpay = require('razorpay');
const { report } = require('../app');
const { rejects } = require('assert');
const { resolve } = require('path');
var instance = new Razorpay({
  key_id: 'rzp_test_KHgBj4Fn2XoVfO',
  key_secret: 'ja7e3evVv0RYTqqgugUZlicb',
});
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get().collection('user').insertOne(userData).then((data) => {
          resolve(data.ops[0]);
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  doAdminSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get().collection('admin').insertOne(userData).then((data) => {
          resolve(data.ops[0]);
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user
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

GetProduct:(category)=>{
  return new Promise(async(resolve,reject)=>{
    let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category}).toArray()
    resolve(products)
  
})
},



  //  admin login

  doALogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: userData.email })
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




  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proId)
        console.log(proExist);
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
              {
                $inc: { 'products.$.quantity': 1 }
              }).then(() => {
                resolve()
              })
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
            {

              $push: { products: proObj }

            }
          ).then((response) => {
            resolve()
          })

        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve()
        })
      }
    })
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }

      ]).toArray()
      //console.log(cartItems[0].products);
      resolve(cartItems)
    })
  },

viewOrderproducts:(orderId)=>{
  return new Promise(async (resolve, reject) => {
    let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: { _id: objectId(orderId) }
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: collection.PRODUCT_COLLECTION,
          localField: 'item',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $project: {
          item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
        }
      }

    ]).toArray()
    //console.log(cartItems[0].products);
    resolve(orderItems)
  })
},

  viewOrderDetails: (userID) => {
  return new Promise(async (resolve, reject) => {
  let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userID)}).toArray()
  console.log(orderDetails);
  resolve(orderDetails)
    }
      )
    },
    viewRecentOrderDetails: (userID) => {
      return new Promise(async (resolve, reject) => {
        try {
          let orderDetails = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find({ userId: objectId(userID) })
            .sort({ _id: -1 })
            .limit(1)
            .toArray();
    
          if (orderDetails.length > 0) {
            console.log(orderDetails[0]);
            resolve(orderDetails[0]);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    }
    ,


  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (cart) {
        count = cart.products.length
      }
      resolve(count)
    })
  },

  changeProductQuantity: (details) => {

    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } }
            }).then((response) => {
              resolve({ removeProduct: true })
            })
      }
      else {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
            {
              $inc: { 'products.$.quantity': details.count }
            }).then((response) => {
              resolve({ status: true })
            })
      }
    })
  },
  removeFromCart: (details) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION)
        .updateOne({ _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } }
          }).then((response) => {
            resolve({ removeCartProduct: true })
          })

    })
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
        , {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
          }
        }

      ]).toArray()
      //console.log(total[0].total);
      resolve(total[0].total)
    })
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, total);
      let status = order.paymentMethod === 'cod' ? 'placed' : 'pending'
      let orderObj = {
        deliveryDetails: {
          name:order.NAME,
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
          state:order.state,
          city:order.city
        },
        userId: objectId(order.userId),
        PaymentMethod: order.paymentMethod,
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(),
        deliveryStatus:order.deliveryStatus,

      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(order.userId) })
        resolve(response.ops[0]._id)
      })
    })
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      resolve(products)
    })
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else
          // console.log("order=>>",order);
          resolve(order)
      });
    })
  },
  verifyPayment: (details) => {


    return new Promise((resolve, reject) => {

      const {
        createHmac,
      } = require('node:crypto');
      let hmac = crypto.createHmac('sha256', 'ja7e3evVv0RYTqqgugUZlicb');
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex');
      if (hmac == details['payment[razorpay_order_id]']) {
        resolve()
      } else {
        reject()
      }
    })


  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) }), {
        $set: {
          status: 'placed'
        }
      }
    }).then(() => {
      resolve()
    })
  },






  getUserDetails:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
            resolve(user)
        })
    })
},



editProfile:(userId,userDetails)=>{
  return new Promise((resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
          $set:{
              Fname:userDetails.Fname,
              username:userDetails.username,
              email:userDetails.email,
              bio:userDetails.bio,
              phone:userDetails.phone,
              dob:userDetails.dob
          }
      }).then((users)=>{
        resolve()  
      })
  })
},

getAllContractors: () => {
  return new Promise((resolve, reject) => {
    db.get().collection(collection.CONTRACTOR_COLLLECTION).find().toArray((err, contractors) => {
      if (err) {
        reject(err);
      } else {
        resolve(contractors);
      }
    });
  });
}

 
}
