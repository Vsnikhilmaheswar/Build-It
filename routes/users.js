var express = require('express');
var router = express.Router();
var producthelper = require('../helpers/product-helpers');
var userHelper = require('../helpers/user-helpers');
const { route } = require('./admin');
const { USER_COLLECTION } = require('../config/collections');
const userHelpers = require('../helpers/user-helpers');
const async = require('hbs/lib/async');
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    req.session.user = false
    res.redirect('/login')
  }
}
//const { response } = require('../app');
/* GET home page. */



// router.get('/', async function (req, res, next) {

//   let user = req.session.user
//   // console.log(user);
//   let cartCount = null
//   if (req.session.user) {
//     cartCount = await userHelper.getCartCount(req.session.user._id)
//   }
//   producthelper.getAllProducts().then((products) => {
//     //console.log(products)
//     res.render('user/view-product', { products, user, cartCount })
//   })
// });
router.get('/', async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  let contractors = [];
  let category= [];
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }

  try {
    contractors = await userHelpers.getAllContractors();
  } catch (error) {
    console.log(error);
  }
 category=await producthelper.getcategories()
console.log(category)
  producthelper.getAllProducts().then((products) => {
    res.render('user/view-product', { contractors,user, cartCount,category });
  });
});





router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('user/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})



router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response
    req.session.user.loggedIn = true
    res.redirect('/')
  })
})

router.get('/profile',verifyLogin, async(req,res)=>{

  let user = req.session.user
  console.log("user id",req.session.user._id);
 let userData=await userHelper.getUserDetails(req.session.user._id)
 res.render('user/profile',{userData,user})
})



router.get('/edit-profile/:id',async(req,res)=>{
console.log(req.params.id)
let user = req.session.user
  let userData=await userHelper.getUserDetails(req.session.user._id)
  //console.log(product)
  res.render('user/edit-profile',{userData,user})
})



router.post('/edit-profile/:id',(req,res)=>{
  let id = req.params.id
  console.log("id  "+id);
  userHelper.editProfile(req.params.id,req.body).then(()=>{
    res.redirect('/profile')
    
    if(req.files.Image)
    {
      let image=req.files.Image
      image.mv('./public/images/userimg/' + id + '.jpg')
      
    }   
  })
})





router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
     
      req.session.user = response.user
      req.session.user.loggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr = "invalid username or password"
      req.session.user = false
      res.redirect('/login')

    }
  })
})
router.get('/logout', (req, res) => {
  req.session.user=null
  req.session.user = false
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  console.log(products);
  let totalValue=0
  if(products.length>0){
   totalValue = await userHelper.getTotalAmount(req.session.user._id)
  }
  res.render('user/cart', { products, user: req.session.user._id, totalValue })
})

router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.user) {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ 'status': true })
  })
  
}else{
   //res.redirect('/');
  res.json({ 'status': false })
}
}
)

router.post('/change-product-quantity', (req, res, next) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-from-cart', (req, res, next) => {
  userHelper.removeFromCart(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})

router.post('/place-order', async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId)
  let totalPrice = await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body, products, totalPrice).then((orderid) => {
    if (req.body['paymentMethod'] == 'cod') {
      res.json({ codSuccess: true })
    } else {
      userHelper.generateRazorpay(orderid, totalPrice).then((response) => {
        res.json(response)
      })

    }
  })
  console.log(req.body)
})

router.get('/order-success', async(req, res) => {
  let orders=await userHelpers.viewRecentOrderDetails(req.session.user._id)
  res.render('user/order-success', { user: req.session.user,orders })
})

router.get('/orders',verifyLogin,async (req, res) => {
 let orders=await userHelpers.viewOrderDetails(req.session.user._id)

  res.render('user/orders', { orders,user: req.session.user })
})


router.get('/view-orderProduct/:id',async(req,res)=>{
let product= await userHelper.viewOrderproducts(req.params.id)
console.log("hekoo",product);

res.render('user/view-orderProduct',{user:req.session.user,product})
})


router.post("/verifypayment", (req, res) => {
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
     console.log("payment success");
      res.json({status:true})
    })
  }).catch((err)=>
  {
    console.log(err);
    res.json({status:false,errMsg:''})
  })

})

router.get('/product/:category', async(req, res) => {
  const category = req.params.category;
  let product = await userHelper.GetProduct(category)
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  res.render('user/product',{product,user:req.session.user,cartCount})});


//admin creation temporary code
router.get('/Adminsignup', (req, res) => {
  res.render('user/Adminsignup')
})


router.post('/Adminsignup', (req, res) => {
  userHelpers.doAdminSignup(req.body).then((response) => {
    console.log(response);
    req.session.admin = response
    req.session.admin.loggedIn = true
    res.redirect('/admin/login')
  })
})
module.exports = router;
