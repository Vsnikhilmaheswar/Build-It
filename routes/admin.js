var express = require('express');
var router = express.Router();
var producthelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
/* GET users listing. */
const userHelpers = require('../helpers/user-helpers');
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/login')
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
      req.session.admin = response.admin;
      req.session.admin = true;
      res.redirect('/admin/dashboard');
    } else {
      req.session.adminLoginErr = "Invalid username or password";
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
  res.render('admin/addcategory')
})

router.get('/alluser', function (req, res) {
  let admin = req.session.admin
  producthelper.getAllUser().then((users) => {
  console.log(users)
    res.render('admin/alluser', { users,admin })
  })
})

router.get('/add-product', function (req, res) {

  res.render('admin/add-product',{ admin : req.session.admin})
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
  console.log(proId);
  productHelpers.delectProduct(proId).then((response) => {
    res.redirect('/admin/dashboard')
  })
})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('admin/view-products')
    
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


router.post('/Adminsignup', (req, res) => {
  userHelpers.
  doAdminSignup(req.body).then((response) => {
    console.log(response);
    req.session.admin = response
    req.session.admin.loggedIn = true
    res.redirect('/')
  })
})
module.exports = router;
