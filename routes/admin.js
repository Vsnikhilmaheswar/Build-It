var express = require('express');
var router = express.Router();
var producthelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
/* GET users listing. */

const verifyLogin = (req, res, next) => {
  if (req.session.user.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
router.get('/', function (req, res, next) {

res.render('admin/login')
  // producthelper.getAllProducts().then((products) => {
  //   //console.log(products)
  //   res.render('admin/view-products', { admin: true, products })
  // })

});
router.get('/add-product', function (req, res) {
  res.render('admin/add-product')
})

router.post('/add-product', (req, res) => {

  // console.log(req.files.Image)
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
    res.redirect('/admin/')
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
    res.redirect('/admin')
    
    if(req.files.Image)
    {
      let image=req.files.Image
      image.mv('./public/images/' + id + '.jpg')
      
    }
  })
})
module.exports = router;
