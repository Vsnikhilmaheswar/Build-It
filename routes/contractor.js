var express = require('express');
const constructorHelper = require('../helpers/constructor-helper');
var router = express.Router();



  router.get('/', (req, res) => {
      res.render("contractors/clogin")
  })
  router.post('/landing', (req, res) => {
    res.render("contractors/landing")
})
  router.get('/addworker', function (req, res) {
    res.render('contractors/addworker')
  })
  router.post('/addworker', (req, res) => {
    const contractorId = req.session.admin._id; // Assuming the contractor's _id is stored in req.session.admin._id
    constructorHelper.addproduct(contractorId, req.body, (workerId) => {
      res.redirect('/c/viewmine');
    });
  });

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
      res.redirect('/c/csignup')
    })
  })

  router.post('/clogin', (req, res) => {
    constructorHelper.doCLogin(req.body).then((response) => {
      if (response.status) {
        req.session.admin = response.admin;
        req.session.admin.loggedIn = true;
        res.redirect('/c/viewmine');
      } else {
        req.session.adminLoginErr = "Invalid username or password";
        res.redirect('/c');
      }
    });
  });


  router.get('/viewmine', (req, res) => {
    const contractorId = req.session.admin._id; // Assuming the contractor's _id is stored in req.session.admin._id
    constructorHelper.getMyWorker(contractorId).then((products) => {
      res.render('contractors/viewmine', { products });
    });
  });
  

module.exports = router;
