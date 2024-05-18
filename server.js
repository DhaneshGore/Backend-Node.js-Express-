const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/rentify', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User model
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller'], required: true }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);

// Property model
const PropertySchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    place: { type: String, required: true },
    area: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    nearby: { type: String },
    likes: { type: Number, default: 0 }
});

const Property = mongoose.model('Property', PropertySchema);

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Register user
app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, phone, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        user = new User({ firstName, lastName, email, phone, password, role });
        await user.save();
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Post a property
app.post('/api/properties', [auth, [
    check('place', 'Place is required').not().isEmpty(),
    check('area', 'Area is required').not().isEmpty(),
    check('bedrooms', 'Number of bedrooms is required').isNumeric(),
    check('bathrooms', 'Number of bathrooms is required').isNumeric()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { place, area, bedrooms, bathrooms, nearby } = req.body;
    try {
        const newProperty = new Property({ owner: req.user.id, place, area, bedrooms, bathrooms, nearby });
        const property = await newProperty.save();
        res.json(property);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        const properties = await Property.find().populate('owner', ['firstName', 'lastName', 'email', 'phone']);
        res.json(properties);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Express interest in a property
app.put('/api/properties/interest/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });
        property.likes += 1;
        await property.save();
        res.json(property);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
