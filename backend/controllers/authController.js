// Temporary storage for users (in production, use a database)
let users = [
  {
    id: '1',
    email: 'sarah@example.com',
    password: 'hashedpassword',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1 (555) 123-4567',
    isHost: true
  },
  {
    id: '2',
    email: 'john@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 987-6543',
    isHost: false
  }
];

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: password, // In production, hash this password
      firstName,
      lastName,
      phone: phone || null,
      isHost: false
    };

    users.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'User registered successfully',
      user: userWithoutPassword,
      token: 'fake-jwt-token-' + newUser.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Login successful',
      user: userWithoutPassword,
      token: 'fake-jwt-token-' + user.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    // In production, get user ID from JWT token
    const userId = req.user?.userId || '1';
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};