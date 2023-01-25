const Sequelize = require('sequelize');

var sequelize = new Sequelize('gjavzgej', 'gjavzgej', 'AaHbEXy35ek8hcisdvbDuo3bJmwg4eSO', {
      host: 'peanut.db.elephantsql.com',
      dialect: 'postgres',
      port: 5432,
      dialectOptions: {
      ssl: { rejectUnauthorized: false }
   },
   query: { raw: true }
});

var Employee = sequelize.define('Employee', {
   employeeID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
   },  
   firstName: Sequelize.STRING, 
   lastName: Sequelize.STRING, 
   email: Sequelize.STRING, 
   phone: Sequelize.STRING, 
   addressStreet: Sequelize.STRING,
   addressCity: Sequelize.STRING,
   addressState: Sequelize.STRING,
   addressPostal: Sequelize.STRING,
   isManager: Sequelize.BOOLEAN, 
   status: Sequelize.STRING,
   hireDate: Sequelize.STRING,
   salary: Sequelize.FLOAT
});

var Department = sequelize.define('Department', {
   departmentId: {
      type: Sequelize.STRING,
      primaryKey: true
   },
   departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});

module.exports = {
   initialize,
   getAllEmployees,
   getManagers,
   getDepartments,
   addEmployee,
   getEmployeesByStatus,
   getEmployeesByDepartmentId,
   getEmployeeById,
   updateEmployee,
   addDepartment,
   updateDepartment,
   getDepartmentById,
   deleteDepartmentById,
   deleteEmployeeById
}

function initialize(){
   return new Promise(function (resolve, reject) {
      sequelize.sync().then(() => {
         resolve();
      }).catch((err)=>{
         reject("unable to sync the database"); 
      });
   });
}

function getAllEmployees(){
   return new Promise(function (resolve, reject) {
      Employee.findAll().then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}

function getManagers(){
   return new Promise(function (resolve, reject) {
      Employee.findAll({
         where: { isManager: true }
      }).then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}

function getDepartments(){
   return new Promise(function (resolve, reject) {
      Department.findAll().then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}

function addEmployee(employeeData){
   return new Promise(function (resolve, reject) {
      employeeData.isManager = (employeeData.isManager) ? true : false;
      for (const property in employeeData) {
         if(employeeData[property] == '') employeeData[property] = null;
      }
      Employee.create(employeeData)
         .then((data) => {
            resolve(data);
         }).catch((err)=>{
            reject("unable to create employee");
         });
   });
}

function getEmployeesByStatus(status){
   return new Promise(function (resolve, reject) {
      Employee.findAll({
         where: { status: status }
      }).then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}

function getEmployeesByDepartmentId(departmentId){
   return new Promise(function (resolve, reject) {
      Employee.findAll({
         where: { departmentId: departmentId }
      }).then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}

function getEmployeeById(eid){
   return new Promise(function (resolve, reject) {
      Employee.findAll({
         where: { employeeID: eid }
      }).then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}

function updateEmployee(employeeData){
   employeeData.isManager = (employeeData.isManager) ? true : false;
   for (const property in employeeData) {
      if(employeeData.property == "") employeeData.property = null;
   }
   return new Promise(function (resolve, reject) {
      Employee.update({
         firstName: employeeData.firstName, 
         lastName: employeeData.lastName, 
         email: employeeData.email, 
         phone: employeeData.phone, 
         addressStreet: employeeData.addressStreet,
         addressCity: employeeData.addressCity,
         addressState: employeeData.addressState,
         addressPostal: employeeData.addressPostal,
         isManager: employeeData.isManager, 
         status: employeeData.status,
         salary: employeeData.salary
      },{
         where: { employeeID: employeeData.employeeID }
      }).then(() => {
         console.log("successfully updated. employeeData.employeeID: ", employeeData.employeeID);
         resolve();
      }).catch((e) => {
         reject("unable to update employee"); 
      });
   });
}

function addDepartment(departmentData){
   for (const property in departmentData) {
      if(departmentData.property == "") departmentData.property = null;
   }
   return new Promise(function (resolve, reject) {
      Department.create(departmentData)
         .then((data) => {
            resolve(data);
         }).catch((err)=>{
            reject("unable to create department");
         });
   });
}

function updateDepartment(departmentData){
   for (const property in departmentData) {
      if(departmentData.property == "") departmentData.property = null;
   }
   return new Promise(function (resolve, reject) {
      Department.update({
         departmentName: departmentData.departmentName
      },{
         where: { departmentId: departmentData.departmentId }
      }).then(() => {
         console.log("successfully updated. dapartmentData.departmentId: " + departmentData.departmentId);
         resolve();
      }).catch((e) => {
         console.log(e);
         reject("unable to update department"); 
      });
   });
}
function getDepartmentById(did){
   return new Promise(function (resolve, reject) {
      Department.findAll({
         where: { departmentId: did }
      }).then((data) => {
         resolve(data);
      }).catch((err) => {
         reject("no results returned"); 
      });
   });
}
function deleteDepartmentById(did){
   return new Promise(function (resolve, reject) {
      Department.destroy({
         where: { departmentId: did }
      }).then(() => {
         console.log("successfully destroyed. DepartmentID: " + did);
         resolve();
      }).catch((err) => {
         reject("unable to destroy the department"); 
      });
   });
}
function deleteEmployeeById(id){
   return new Promise(function (resolve, reject){
      Employee.destroy({
         where: { employeeID: id}
      }).then(()=>{
         console.log("successfully destroyed. employeeID: " + id);
         resolve();
      }).catch((err)=>{
         reject("unable to destroy the employee")
      });
   });
}