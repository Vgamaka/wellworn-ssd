import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './admin.scss'; // Use .scss for better styling
import Logo from '../src/assets/logo.png';

const Admin = () => {
  const [selectedSection, setSelectedSection] = useState(
    localStorage.getItem('selectedSection') || 'dashboard'
  );
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [targetSection, setTargetSection] = useState('');
  const navigate = useNavigate();

  // Passwords for restricted sections
  const passwords = {
    ordertrack: '123',
    orders: 'order123',
    overview: 'overview123',
    users: 'users123',
  };

  // Update selected section based on the URL
  useEffect(() => {
    const currentSection = window.location.pathname.split('/')[2]; // Extract section from URL
    if (currentSection && currentSection !== selectedSection) {
      setSelectedSection(currentSection);
      localStorage.setItem('selectedSection', currentSection);
    }
  }, [window.location.pathname]);

  // Handle section change
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    localStorage.setItem('selectedSection', section); // Save to localStorage
    navigate(`/admin/${section}`); // Navigate to the selected section
    setSidePanelOpen(false); // Close side panel after selecting a section
  };

  // Toggle side panel
  const toggleSidePanel = () => {
    setSidePanelOpen(!isSidePanelOpen);
  };

  // Open password modal for restricted sections
  const openPasswordModal = (section) => {
    setTargetSection(section); // Set the target section
    setPasswordModalOpen(true);
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setEnteredPassword(''); // Clear password input when closing modal
  };

  // Handle password submission
  const handlePasswordSubmit = () => {
    const correctPassword = passwords[targetSection];
    if (enteredPassword === correctPassword) {
      handleSectionChange(targetSection); // Set target section as active
    } else {
      alert('Incorrect password! Access denied.'); // Show error if password is incorrect
    }
    closePasswordModal();
  };

  // Listen for Enter key to submit password
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <div className="admin-container">
      <div className={`nav-bar ${isSidePanelOpen ? 'open' : ''}`}>
        <div className="company-logo">
          <img src={Logo} alt="Wellworn Logo" />
        </div>
        <div className="navlinks">
          <Link
            to="/admin/dashboard"
            className={`nav-link ${selectedSection === 'dashboard' && 'active'}`}
            onClick={() => handleSectionChange('dashboard')}
          >
            <i className="fas fa-tachometer-alt" /> Dashboard
          </Link>
          <Link
            to="/admin/profile"
            className={`nav-link ${selectedSection === 'profile' && 'active'}`}
            onClick={() => handleSectionChange('profile')}
          >
            <i className="fas fa-user" /> Profile
          </Link>
          <Link
            to="/admin/products"
            className={`nav-link ${selectedSection === 'products' && 'active'}`}
            onClick={() => handleSectionChange('products')}
          >
            <i className="fas fa-shopping-bag" /> Products
          </Link>
          <Link
            to="#"
            className={`nav-link ${selectedSection === 'users' && 'active'}`}
            onClick={() => openPasswordModal('users')}
          >
            <i className="fas fa-users" /> Users
          </Link>
          <Link
            to="#"
            className={`nav-link ${selectedSection === 'orders' && 'active'}`}
            onClick={() => openPasswordModal('orders')}
          >
            <i className="fas fa-shopping-cart" /> Orders
          </Link>
          <Link
            to="#"
            className={`nav-link ${selectedSection === 'ordertrack' && 'active'}`}
            onClick={() => openPasswordModal('ordertrack')}
          >
            <i className="fas fa-map" /> Tracking
          </Link>
          <Link
            to="/admin/rating"
            className={`nav-link ${selectedSection === 'rating' && 'active'}`}
            onClick={() => handleSectionChange('rating')}
          >
            <i className="fas fa-star" /> Ratings
          </Link>
          <Link
            to="#"
            className={`nav-link ${selectedSection === 'overview' && 'active'}`}
            onClick={() => openPasswordModal('overview')}
          >
            <i className="fas fa-chart-simple" /> Overview
          </Link>
          <Link
            to="/admin/faq"
            className={`nav-link ${selectedSection === 'faq' && 'active'}`}
            onClick={() => handleSectionChange('faq')}
          >
            <i className="fas fa-question-circle" /> FAQs
          </Link>
        </div>
      </div>

      <div className="content-area">
        <Outlet /> {/* Render matched child route component */}
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="password-modal">
            <h2>
              Enter Password for the{' '}
              {targetSection.charAt(0).toUpperCase() + targetSection.slice(1)} Page
            </h2>
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Password"
            />
            <div className="modal-buttons">
              <button onClick={handlePasswordSubmit}>Submit</button>
              <button onClick={closePasswordModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="menu-toggle" onClick={toggleSidePanel}>
        &#9776; {/* Unicode for hamburger menu */}
      </div>
    </div>
  );
};

export default Admin;
