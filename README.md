# HR System App
## About
This is a web application which is designed for HR department.
When ID is admin, you have full access to the app. Otherwise, your access is limited where you cannot see the salary, remove or add a employee.


## Key Features

- CRUD app using Node.js and Express.js on the back-end
- Used Postgres database to store all the data added by user
- User data and their activity is stored using MongoDB
- Password stored as hashed passwords using bcrypt.js
- Built interface using Handlebars to render data visually in the browser using .hbs
- Used Bootstrap to style the app


## Main Frameworks/Libraries used

- Node.js
- Express.js
- Handlebars.js
- PostgreSQL
- MongoDB
- Bcrypt.js

## Try the app

This web app is deployed at [https://hr-system-app.cyclic.app/](https://hr-system-app.cyclic.app/)

| userID | password | access | 
|---|---|---|
| AdminUser | password1 | full access |
| TestUser | password2 | limited access |

When you login as AdminUser, you can see saraly and remove or update employees and departments.
![Screen Shot 2023-01-25 at 14 51 14](https://user-images.githubusercontent.com/95828247/214676796-de6ad803-e080-4c86-84fb-723908823746.png)
![Screen Shot 2023-01-25 at 14 53 41](https://user-images.githubusercontent.com/95828247/214676899-b15c3242-011e-4506-8f7d-51064fc6e813.png)

When you login as TestUser which is not admin, you no longer have access to those information and those functions.
![Screen Shot 2023-01-25 at 14 50 33](https://user-images.githubusercontent.com/95828247/214677199-9a879840-24d2-405d-9677-e0eae225161c.png)
![Screen Shot 2023-01-25 at 14 50 48](https://user-images.githubusercontent.com/95828247/214677224-ced4ff61-6b19-457d-b74c-30474fbe8afe.png)


Try the app yourself!

