var express = require('express');
const constructorHelper = require('../helpers/constructor-helper');
var router = express.Router();

router.get('/', (req, res) => {
  res.render("contractors/clogin"); // Render contractor login page
});

router.post('/landing', (req, res) => {
  res.render("contractors/landing"); // Render landing page after form submission
});

router.get('/addworker', function (req, res) {
  res.render('contractors/addworker'); // Render add worker form page
});

router.post('/addworker', (req, res) => {
  const contractorId = req.session.admin._id; // Get the logged-in contractor's _id from the session
  constructorHelper.addproduct(contractorId, req.body, (workerId) => {
    res.redirect('/c/viewmine'); // After adding a worker, redirect to the viewmine page
  });
});

router.get('/editworker/:id', async (req, res) => {
  let product = await constructorHelper.getProductDetails(req.params.id);
  console.log(product);
  res.render('contractors/editworker', { product }); // Render edit worker form page with worker details
});

router.post('/editworker/:id', (req, res) => {
  constructorHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/c/viewmine'); // After editing a worker, redirect to the viewmine page
  });
});

router.get('/delworker/:id', async (req, res) => {
  const workerId = req.params.id;
  try {
    await constructorHelper.deleteWorker(workerId); // Delete the specified worker
    res.redirect('/c/viewmine'); // After deleting a worker, redirect to the viewmine page
  } catch (error) {
    // Handle error appropriately
    console.error(error);
    res.redirect('/c');
  }
});

router.get('/csignup', (req, res) => {
  res.render('contractors/csignup'); // Render contractor signup form page
});

router.post('/csignup', (req, res) => {
  constructorHelper.doConSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response;
    req.session.user.loggedIn = true;
    res.redirect('/c/csignup'); // After contractor signup, redirect to contractor signup page
  });
});

router.post('/clogin', (req, res) => {
  constructorHelper.doCLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.admin.loggedIn = true;
      res.redirect('/c/viewmine'); // After contractor login, redirect to the viewmine page
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect('/c'); // If login fails, redirect back to the contractor login page
    }
  });
});

router.get('/viewmine', (req, res) => {
  const contractorId = req.session.admin._id; // Get the logged-in contractor's _id from the session
  constructorHelper.getMyWorker(contractorId).then((products) => {
    res.render('contractors/viewmine', { products }); // Render the viewmine page with workers specific to the logged-in contractor
  });
});

router.post('/assignflag/:id', (req, res) => {
  const contractorId = req.session.admin._id;
  const workerId = req.params.id;
  constructorHelper.updateFlag(contractorId, workerId, true).then(() => {
    res.redirect('/c/viewmine');
  });
});

router.post('/removeflag/:id', (req, res) => {
  const contractorId = req.session.admin._id;
  const workerId = req.params.id;
  constructorHelper.updateFlag(contractorId, workerId, false).then(() => {
    res.redirect('/c/viewmine');
  });
});

router.get('/request', (req, res) => {
  res.render("contractors/getreq"); // Render landing page after form submission
});

router.post('/request', (req, res) => {
  var requestData = req.body; // Get the request details data from the form

  // Call the helper function to store the request data
  constructorHelper.storereq(requestData, (status) => {
    if (status) {
      res.redirect('/'); // Redirect to success page after storing the request details
    } else {
      res.redirect('/error'); // Redirect to error page if storing the request details fails
    }
  });
});

router.get('/cindex',(req,res)=>{
  res.render('contractors/contractorIndex')
})

module.exports = router;
