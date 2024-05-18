import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <PrivateRoute path="/properties" component={PropertyList} />
        <Route path="/" exact component={Home} />
      </Switch>
    </Router>
  );
};

const Navbar = () => (
  <nav>
    <h1>Rentify</h1>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/register">Register</a></li>
      <li><a href="/login">Login</a></li>
      <li><a href="/properties">Properties</a></li>
    </ul>
  </nav>
);

const Home = () => (
  <div>
    <h1>Welcome to Rentify</h1>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer'
  });

  const { firstName, lastName, email, phone, password, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', formData);
      console.log(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>First Name</label>
        <input type="text" name="firstName" value={firstName} onChange={onChange} required />
      </div>
      <div>
        <label>Last Name</label>
        <input type="text" name="lastName" value={lastName} onChange={onChange} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={email} onChange={onChange} required />
      </div>
      <div>
        <label>Phone</label>
        <input type="text" name="phone" value={phone} onChange={onChange} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" name="password" value={password} onChange={onChange} required />
      </div>
      <div>
        <label>Role</label>
        <select name="role" value={role} onChange={onChange} required>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', formData);
      console.log(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={email} onChange={onChange} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" name="password" value={password} onChange={onChange} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

const PropertyList = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('/api/properties');
        setProperties(res.data);
      } catch (err) {
        console.error(err.response.data);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div>
      <h1>Properties</h1>
      <ul>
        {properties.map(property => (
          <li key={property._id}>
            <h2>{property.place}</h2>
            <p>{property.area}</p>
            <p>{property.bedrooms} Bedrooms</p>
            <p>{property.bathrooms} Bathrooms</p>
            <button onClick={() => expressInterest(property._id)}>I'm Interested</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const expressInterest = async id => {
  try {
    const res = await axios.put(`/api/properties/interest/${id}`, {}, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response.data);
  }
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    localStorage.getItem('token') ? <Component {...props} /> : <Redirect to="/login" />
  )} />
);

export default App;
