import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', mobile: '', email: '', password: '', role: '', district: '', qualification: '' });
  const [role, setRole] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // 'farmers', 'scientists', or 'all'

  useEffect(() => {
    if (showUsersModal) {
      fetchUsers();
    }
  }, [showUsersModal]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/users`);
      setUsers(res.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      setErrorMessage('Failed to fetch users');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, formData);
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('sessionExpiry', new Date().getTime() + 30 * 60 * 1000); // 30 minutes
      window.location.href = res.data.role === 'farmer' ? '/farmer' : '/scientist';
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setErrorMessage('Wrong email or password');
      } else {
        setErrorMessage('Login failed: ' + (error.response?.data.error || 'Unknown error'));
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const updatedSignupData = { ...signupData, role };
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, updatedSignupData);
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('sessionExpiry', new Date().getTime() + 30 * 60 * 1000); // 30 minutes
      window.location.href = res.data.role === 'farmer' ? '/farmer' : '/scientist';
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      setErrorMessage('Signup failed: ' + (error.response?.data.error || 'Unknown error'));
    }
  };

  const filteredUsers = users.filter(user => {
    if (userFilter === 'farmers') return user.role === 'farmer';
    if (userFilter === 'scientists') return user.role === 'scientist';
    return true; // 'all'
  });

  return (
    <div className="background">
      <button
        onClick={() => setShowUsersModal(true)}
        className="registered-users-btn"
      >
        Registered Users
      </button>
      <div className="login-container">
        <h1>{isSignup ? 'Sign Up' : 'Login'}</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!isSignup ? (
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="submit" className="submit-btn">Login</button>
          </form>
        ) : (
          <>
            <div className="role-buttons">
              <button onClick={() => setRole('farmer')} className="farmer-btn">As Farmer</button>
              <button onClick={() => setRole('scientist')} className="scientist-btn">As Agro-Scientist</button>
            </div>
            {role && (
              <form onSubmit={handleSignup} className="login-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={signupData.name}
                  onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={signupData.mobile}
                  onChange={e => setSignupData({ ...signupData, mobile: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                />
                {role === 'farmer' && (
                  <input
                    type="text"
                    placeholder="District"
                    value={signupData.district}
                    onChange={e => setSignupData({ ...signupData, district: e.target.value })}
                  />
                )}
                {role === 'scientist' && (
                  <input
                    type="text"
                    placeholder="Qualification"
                    value={signupData.qualification}
                    onChange={e => setSignupData({ ...signupData, qualification: e.target.value })}
                  />
                )}
                <button type="submit" className="submit-btn">Sign Up</button>
              </form>
            )}
          </>
        )}
        <button onClick={() => setIsSignup(!isSignup)} className="switch-btn">
          {isSignup ? 'Switch to Login' : 'Switch to Sign Up'}
        </button>
      </div>

      {showUsersModal && (
        <div className="users-modal">
          <div className="users-modal-content">
            <span className="close-btn" onClick={() => setShowUsersModal(false)}>×</span>
            <h2>Registered Users</h2>
            <div className="radio-buttons">
              <label>
                <input
                  type="radio"
                  value="farmers"
                  checked={userFilter === 'farmers'}
                  onChange={() => setUserFilter('farmers')}
                />
                Farmers
              </label>
              <label>
                <input
                  type="radio"
                  value="scientists"
                  checked={userFilter === 'scientists'}
                  onChange={() => setUserFilter('scientists')}
                />
                Agro-Scientists
              </label>
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={userFilter === 'all'}
                  onChange={() => setUserFilter('all')}
                />
                All Users
              </label>
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  {userFilter === 'farmers' && <th>District</th>}
                  {userFilter === 'scientists' && <th>Qualification</th>}
                  {(userFilter === 'all') && <th>Role</th>}
                  {(userFilter === 'all') && <th>District/Qualification</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={userFilter === 'all' ? 5 : 4}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.mobile}</td>
                      <td>{user.email}</td>
                      {userFilter === 'farmers' && <td>{user.district}</td>}
                      {userFilter === 'scientists' && <td>{user.qualification}</td>}
                      {userFilter === 'all' && <td>{user.role}</td>}
                      {userFilter === 'all' && <td>{user.role === 'farmer' ? user.district : user.qualification}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
