
const express = require("express");
const app = express();
const path = require("path");
const fs  = require('fs');
const multer = require("multer");
const exphbs = require('express-handlebars');
const clientSessions = require("client-sessions");

const dataServiceAuth = require('./data-service-auth.js');
const dataService = require('./data-service.js');
const { resolve } = require("path");
app.engine('.hbs', exphbs.engine({ extname: '.hbs' ,
helpers:{
   navLink: function(url, options){
      return '<li' + 
         ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
         '><a href="' + url + '">' + options.fn(this) + '</a></li>';
   },
   
   equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
         throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
         return options.inverse(this);
      } else {
         return options.fn(this);
      }
   }
}}));
app.set('view engine', '.hbs');
const HTTP_PORT = process.env.PORT || 8080;


app.use(express.urlencoded({ extended: true })); 

function onHttpStart() {
   console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(function(req, res, next){
   let route = req.baseUrl + req.path;
   app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
   next();
});

app.use(clientSessions({
   cookieName: "session", // this is the object name that will be added to 'req'
   secret: "thisShouldBeSecret", // this should be a long un-guessable string.
   duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
   activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
 }));

app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
   res.locals.session = req.session;
   next();
});

function ensureLogin(req, res, next) {
   if (!req.session.user) {
      res.redirect("/login");
   } else {
      next();
   }
};

app.get("/login", function(req, res){
   res.render('login');
});

app.get("/register", function(req, res){
   res.render('register');
});

app.get("/", function(req,res){
   res.render('home');
});

app.get("/about", function(req,res){
   req.session.user;
   res.render('about');
});

app.post("/register", function(req, res){
   dataServiceAuth.registerUser(req.body).then(()=>{
      res.render('register', {successMessage: "User created"});
   }).catch((err)=>{
      res.render('register', {errorMessage: err, userName: req.body.userName});
   });
});

app.post("/login", function(req,res){
   req.body.userAgent = req.get('User-Agent');
   dataServiceAuth.checkUser(req.body).then((user) => {
      req.session.user = {
         userName: user.userName, // authenticated user's userName
         email: user.email, // authenticated user's email
         loginHistory: user.loginHistory, // authenticated user's loginHistory
         isAdmin: user.isAdmin
      }
      res.redirect('/employees');
   }).catch((err)=>{
      res.render('login', {errorMessage: err, userName: req.body.userName});
   });   
});

app.get("/logout", function(req, res) {
   req.session.reset();
   res.redirect("/");
});

app.get("/userHistory", ensureLogin, function(req, res) {
   res.render("userHistory");
});

app.post("/employees/add", ensureLogin, function(req,res){
   dataService.addEmployee(req.body).then(()=>{
      res.redirect("/employees");
   }).catch((err)=>{
      res.send(err);
   });
});

app.post("/departments/add", ensureLogin, function(req,res){
   dataService.addDepartment(req.body).then(()=>{
      res.redirect("/departments");
   }).catch((err)=>{
      res.send(err);
   });
});

app.get("/employees/add", ensureLogin, function(req,res){
   dataService.getDepartments().then((data)=>{
      res.render("addEmployee",{departments: data});
   }).catch((err)=>{
      res.render("addEmployee", {departments: []});    
   });
});

app.get("/departments/add", ensureLogin, function(req,res){
   dataService.getDepartments().then((data)=>{
      res.render("addDepartment",{departments: data});
   }).catch((err)=>{
      res.render("addDepartment", {departments: []});    
   });
});

app.post("/employee/update", ensureLogin, (req, res) => {
   dataService.updateEmployee(req.body).then(()=>{
      res.redirect("/employees");
   }).catch((err)=>{
      res.status(500).send("Unable to Update Employee");
   });
});

app.post("/department/update", ensureLogin, (req, res) => {
   dataService.updateDepartment(req.body).then(()=>{
      res.redirect("/departments");
   }).catch((err)=>{
      res.status(500).send("Unable to Update Department");
   });
});

app.get("/employees", ensureLogin, (req,res) => {
   if(req.query.status){
      var status = req.query.status;
      dataService.getEmployeesByStatus(status).then((data)=>{
         if(data[0]){
            res.render("employees", {employees: data});
         }else{
            res.render("employees", {message: "no results"});
         }
      }).catch((err)=>{
         res.render("employees", {message: "no results"});
      })
   } else if(req.query.department){
      var departmentId = req.query.department;
      dataService.getEmployeesByDepartmentId(departmentId).then((data)=>{
         if(data[0]){
            res.render("employees", {employees: data});
         }else{
            res.render("employees", {message: "no results"});
         }
      }).catch((err)=>{
         res.render("employees", {message: "no results"});
      })
   } else {
      dataService.getAllEmployees().then((data)=>{
         if(data[0]){
            res.render("employees", {employees: data});
         }else{
            res.render("employees", {message: "no results"});
         }         
      }).catch((err)=>{
         res.render("employees", {message: "no results"});
      });
   }
});

app.get("/employees/:employeeId", ensureLogin, (req, res) => {
   // initialize an empty object to store the values
   let viewData = {};

   dataService.getEmployeeById(req.params.employeeId).then((data) => {
      if (data[0]) {
         viewData.employee = data[0]; //store employee data in the "viewData" object as "employee"
      } else {
         viewData.employee = null; // set employee to null if none were returned
      }
   }).catch(() => {
      viewData.employee = null; // set employee to null if there was an error 
   }).then(dataService.getDepartments).then((data) => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the department that matches
      // the employee's "department" value, add a "selected" property to the matching 
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
         if (viewData.departments[i].departmentId == viewData.employee.department) {
            viewData.departments[i].selected = true;
         }
      }
   }).catch(() => {
       viewData.departments = []; // set departments to empty if there was an error
   }).then(() => {
      if (viewData.employee == null) { // if no employee - return an error
         res.status(404).send("Employee Not Found");
      } else {
         // console.log("viewData:", viewData);
         res.render("employee", { viewData: viewData }); // render the "employee" view
      }
   }).catch((err)=>{
      res.status(500).send("Unable to Show Employees");
   });
});


app.get("/department/:departmentId", ensureLogin, (req, res)=>{
   // initialize an empty object to store the values
   let department = {};
   dataService.getDepartmentById(req.params.departmentId).then((data) => {
      if (data[0]) {
         department = data[0]; //store department data in the department
      } else {
         department = null; // set department to null if none were returned
      }
   }).catch((err) => {
      department = null; // set department to null if there was an error 
   }).then(() => {
      if (department == null) { // if no department - return an error
         res.status(404).send("Department Not Found");
      } else {
         res.render("department", { department : department }); // render the program
      }
   }).catch((err)=>{
      res.status(500).send("Unable to Show Departments");
   });
})

app.get("/departments/delete/:departmentId", ensureLogin, (req, res)=>{
   var did = req.params.departmentId;
   dataService.deleteProgramByCode(did).then((data)=>{
      res.redirect("/departments");
   }).catch((err)=>{
      res.status(500).send("Unable to Remove Department / Department not found)"); 
   });
})

app.get("/employees/delete/:employeeId", ensureLogin, (req, res)=>{
   var id = req.params.employeeId;
   dataService.deleteEmployeeById(id).then((data)=>{
      res.redirect("/employees");
   }).catch((err)=>{
      console.log(err)
      res.status(500).send("Unable to Remove Employee / Employee not found)"); 
   });
})

const storage = multer.diskStorage({
   destination: "./public/images/uploaded/",
   filename: function (req, file, cb) {
     cb(null, Date.now() + path.extname(file.originalname));
   }
});

const upload = multer({ storage: storage });
app.use(express.static("./public/"));

app.get("/images/add", ensureLogin, (req, res) => {
   res.render('addImage');
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
   res.redirect("/images");
});

app.get("/images", ensureLogin, (req, res)=>{
   fs.readdir("./public/images/uploaded", function(err, items){
      res.render("images", {images:items});
   });
});

app.get("/managers", ensureLogin, (req,res) => {
   dataService.getManagers().then((data)=>{
      res.render("employees", {employees: data});
   }).catch((err)=>{
      res.render("employees", {message: "no results"});
   });
});

app.get("/departments", ensureLogin, (req,res) => {
   dataService.getDepartments().then((data)=>{
      if(data[0] === undefined){
         res.render("departments", {message: "no results"});
      }else{
         res.render("departments", {departments: data});
      }
   }).catch((err)=>{
      res.render("departments", {message: "no results"});
   });
});

app.use((req, res) => {
   res.status(404).send(`
   <br>
   <h1>404</h1>
   <h2>Page Not Found</h2>
`);
});





dataService.initialize()
.then(dataServiceAuth.initialize)
.then(()=>{
      app.listen(HTTP_PORT, onHttpStart);
   }).catch((err)=>{
      console.log("Error: ", err)
})