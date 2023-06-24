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
     res.redirect('/c/addworker')
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

  router.get('/delworker/:id', async (req, res) => {

      const workerId = req.params.id;
      try
      {
        await constructorHelper.deleteWorker(workerId);
        res.redirect('/c/viewworker');
      } 
    catch (error) {
      // Handle error appropriately
      console.error(error);
      res.redirect('/c');
    }
  });
  

  //contractors

  router.get('/csignup', (req, res) => {
    res.render('contractors/csignup')
  })

  router.post('/csignup', (req, res) => {
    constructorHelper.doConSignup(req.body).then((response) => {
      console.log(response);
      req.session.user = response
      req.session.user.loggedIn = true
      res.redirect('/c')
    })
  })

  router.get('/clogin', (req, res) => {
    res.render('contractors/clogin')
  })

  router.post('/clogin', (req, res) => {
    constructorHelper.login(req.body).then((user) => {
      req.session.user = user;
      req.session.user.loggedIn = true;
      res.redirect('/c/viewworker');
    }).catch((error) => {
      console.log(error);
      res.redirect('/c/clogin');
    });
  });

  
module.exports = router;
