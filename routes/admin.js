var express = require('express');
var router = express.Router();
var producthelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
/* GET users listing. */
const userHelpers = require('../helpers/user-helpers');
const async = require('hbs/lib/async');
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/')
  }
}
// router.get('/', function (req, res, next) {

// });

router.get('/', (req, res) => {
  res.render('admin/login', { "loginErr": req.session.adminLoginErr });
});

router.post('/login', (req, res) => {
  userHelpers.doALogin(req.body).then((response) => {
    if (response.status) {
      
      req.session.admin = response.admin
      req.session.admin.loggedIn = true
      res.redirect('/admin/dashboard');
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      req.session.admin = false;
      res.redirect('/admin');
    }
  });
});
router.get('/dashboard',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  producthelper.getAllProducts().then((products) => {
    //console.log(products)
    res.render('admin/view-products', { admin, products })
  })
})

router.get('/addCategory',verifyLogin,(req,res)=>{
  let admin =  req.session.admin
  res.render('admin/addcategory',{admin})
})


router.post('/addCategory',verifyLogin,(req,res)=>{
  let admin =  req.session.admin


  producthelper.addcategory(req.body, (id) => {
    let image = req.files.Image
    console.log(id)
    image.mv('./public/images/cateimg/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/addCategory",{admin})
      } else {
        console.log(err);
      }
    })
  })

})

router.get('/alluser', function (req, res) {
  let admin = req.session.admin
  producthelper.getAllUser().then((users) => {
  console.log(users)
    res.render('admin/alluser', { users,admin })
  })
})

router.get('/allorder', function (req, res) {
  let admin = req.session.admin
  producthelper.getAllorder().then((orders) => {
  console.log(orders)
    res.render('admin/allorder', { orders,admin })
  })
})

router.post('/update-delivery-status',function(req,res){
  
})
router.get('/add-product',async function (req, res) {
  category=await producthelper.getcategories()
  res.render('admin/add-product',{ admin : req.session.admin,category})
})

router.post('/add-product', (req, res) => {

   console.log(req.files.Image)
  producthelper.addproduct(req.body, (id) => {
    let image = req.files.Image
    console.log(id)
    image.mv('./public/images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product")
      } else {
        console.log(err);
      }
    })
  });
})

  



router.get('/delete-product/:id',(req,res) => {
  var proId = req.params.id
  let admin = req.session.admin
  console.log(proId);
  productHelpers.delectProduct(proId).then((response) => {
    res.redirect('/admin/dashboard',)
  })
})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  let admin = req.session.admin
  res.render('admin/edit-product',{product,admin})
})

router.post('/edit-product/:id',(req,res)=>{
  let id = req.params.id
  let admin = req.session.admin
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('admin/view-products',{admin})
    
    if(req.files.Image)
    {
      let image=req.files.Image
      image.mv('./public/images/' + id + '.jpg')
      
    }
  })
})


router.get('/Adminsignup', (req, res) => {
  res.render('admin/Adminsignup')
})


//  

module.exports = router;
