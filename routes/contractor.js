var express = require('express');
const constructorHelper = require('../helpers/constructor-helper');
var router = express.Router();



  router.get('/', (req, res) => {
      res.render("contractors/landing")
  })
  router.get('/addworker', function (req, res) {
    res.render('contractors/addworker')
  })
  router.post('/addworker', (req, res) => {
   constructorHelper.addproduct(req.body, (id) => {
     console.log(id)
     res.render("contractors/addworker")
   });
 })

 router.get('/viewworker',(req,res)=>{
    constructorHelper.getAllProducts().then((products) => {
      //console.log(products)
      res.render('contractors/viewworker', {products})
    })
  })


  router.get('/editworker/:id',async(req,res)=>{
    let product=await constructorHelper.getProductDetails(req.params.id)
    console.log(product)
    res.render('contractors/editworker',{product})
  })
  
  router.post('/editworker/:id',(req,res)=>{
    constructorHelper.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/c')
    })
  })
module.exports = router;
