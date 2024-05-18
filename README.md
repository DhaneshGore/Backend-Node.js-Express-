# Backend-Node.js-Express-
This file sets up the server, connects to the database, and includes user authentication and property management routes.
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Property/
│   │   │   ├── PropertyList.js
│   │   │   ├── PropertyItem.js
│   │   │   ├── AddProperty.js
│   │   │   └── PropertyDetails.js
│   │   └── Layout/
│   │       ├── Navbar.js
│   │       └── PrivateRoute.js
│   ├── context/


backend/
├── models/
│   ├── User.js
│   └── Property.js
├── routes/
│   ├── auth.js
│   └── properties.js
├── server.js
└── config/
    └── db.js
