import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">airbnbbm</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <span className="search-icon">🔍</span>
              </button>
            </div>
          </form>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-icon">👤</span>
                <span className="user-name">{user?.firstName}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/notifications" className="dropdown-item">
                    Notifications
                  </Link>
                  <Link to="/bookings" className="dropdown-item">
                    My Bookings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">
                Log In
              </Link>
              <Link to="/register" className="auth-button signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;