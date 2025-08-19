import { useState, useEffect } from 'react';
import axios from 'axios';
import './User.scss';
import { Link } from 'react-router-dom';
import AuthAPI from '../src/api/AuthAPI';
import Notification from './Notification';
import Loading from './Loading'; // Import reusable Loading component

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); // Show loader before API call
        const response = await AuthAPI.fetchCustomers();
        setUsers(response.data.customers);
        setLoading(false); // Hide loader after API call
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false); // Hide loader even on error
      }
    };
    
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on the search term
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      return fullName.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearch = () => {
    // Filter users based on the search term
    // The useEffect will handle the filtering, so you can leave this function empty
  };
  if (loading) {
    return <Loading />; // Show the reusable Loading component
  }
  
  return (
    <div>  <Notification />

<div className="user-containersz">

  <div className="user-section-title">
    
    USERES SECTION
  </div>
  <h1 className="subtitle">Existing Users : ({filteredUsers.length})</h1>
  <div className="search-bar">
    <input
      type="text"
      placeholder="Search user..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
    <button className="search-buttonfd" onClick={handleSearch}>
      <i className="fas fa-search" />
    </button>
  </div>
  <div>
    <table className="user-table">
      <thead>
        <tr>
          <th>User Id</th>
          <th>Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user.UserId}>
            <td>{user.UserId}</td>
            <td>{`${user.firstName} ${user.lastName}`}</td>
            <td>{user.email}</td>
            <td>
              <Link to={`/admin/userdetails/${user.UserId}`} className="view-more-button">
                View More
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
</div>
     
  );
};

export default Users;
