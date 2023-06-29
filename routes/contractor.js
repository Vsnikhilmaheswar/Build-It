var express = require('express');
const constructorHelper = require('../helpers/constructor-helper');
const session = require('express-session');
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
  constructorHelper.doConSignup(req.body)
    .then((contractorId) => {
      console.log(contractorId);
      req.session.user = req.body;
      req.session.user._id = contractorId; // Assign the contractor's _id to the session user
      req.session.user.loggedIn = true;
      constructorHelper.getContractorDetails(contractorId) // Retrieve the contractor details
        .then((contractor) => {
          res.redirect(`/c/viewworker/${contractorId}`);
        })
        .catch((error) => {
          console.log(error);
          res.redirect('/error-page'); // Redirect to an error page if necessary
        });
    })
    .catch((error) => {
      console.log(error);
      res.redirect('/error-page'); // Redirect to an error page if necessary
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

router.get('/viewmine/:id', (req, res) => {
  const contractorId = req.params.id; // Get the logged-in contractor's _id from the session
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

router.get('/viewworker', (req, res) => {
  const contractorId = req.session.admin._id; // Get the logged-in contractor's _id from the session
  constructorHelper.getMyWorker(contractorId).then((products) => {
    res.render('contractors/viewworker', { products }); // Render the viewmine page with workers specific to the logged-in contractor
  });
});

router.get('/viewworker/:id', (req, res) => {
  const contractorId = req.params.id; // Get the logged-in contractor's _id from the session
  constructorHelper.getMyWorker(contractorId).then((products) => {
    res.render('contractors/viewworker', { products }); // Render the viewmine page with workers specific to the logged-in contractor
  });
});

router.get('/contraProfile/:id', async (req, res) => {
  try {
    let user = req.session.user;
    const contractorId = req.params.id;
    const contractor = await constructorHelper.getContractorDetails(contractorId);
    res.render('contractors/contraProfile', { contractor,user });
  } catch (error) {
    console.error(error);
    res.redirect('/error'); // Handle the error appropriately
  }
});

router.get('/request/:id', (req, res) => {
  const contractorId = req.params.id;
  let user = req.session.user;
  const userId = req.session.user._id;  // Assuming the user ID is stored in the session as "userId"
console.log("contractorId",contractorId);
console.log("userId",userId);
  res.render("contractors/getreq", { contractorId, userId,user }); // Pass contractorId and userId to the rendering template
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
 
module.exports = router;
