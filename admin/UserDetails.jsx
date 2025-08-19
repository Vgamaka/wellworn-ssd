import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import profileImage from '../src/assets/profile.png';
import './UserDetails.scss';
import Notification from './Notification';
import Loading from './Loading'; // Import reusable Loading component

const apiUrl = import.meta.env.VITE_BACKEND_API;

const UserDetails = () => {
  const { UserId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true); // Show loader before API call
        const response = await axios.get(`https://wellworn-4.onrender.com/api/customer/${UserId}`);
        setUser(response.data.customer);
        setLoading(false); // Hide loader after API call
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false); // Hide loader even on error
      }
    };    

    fetchUser();
  }, [UserId]);


  if (loading) {
    return <Loading />; // Use the reusable Loading component
  }
  
  return (
    <div>      <Notification/>
    <div className='mainContainer'>
      <div className="header">
        {/* <h1>User Details</h1> */}
        {/* <Link to="/admin/users" className="backButton">
          <i className='fa-solid fa-angles-left' />
        </Link> */}
      </div>

      <h1>Main Details</h1>
      {/* Main Profile Section */}
      <div className="mainProfileSection">
        <div className="profileImageContainer">
          <img
            src={user.profileImage || profileImage}
            alt="Profile"
            className="profileImage"
          />
        </div>

        <div className="profileDetails">
          <div className='d1'>
            <p>User Id:  </p>
            <p>Name: </p>
            <p>Email: </p>
            <p>Contact: </p>
            <p>Password: </p>
          </div>

          <div className="d2">
            <input type="text" value={user.UserId || 'No details uploaded'} />
            <input type="text" value={`${user.firstName || 'No details uploaded'} ${user.lastName || 'No details uploaded'}`} />
            <input type="text" value={user.email || 'No details uploaded'} />
            <input type="text" value={user.contact || 'No details uploaded'} />
            <input type="text" value={user.password || 'No details uploaded'} />
          </div>
        </div>
      </div>

      {/* <h3>Address Details</h3>
      Address Details Section */}
      {/* <div className="addressDetailsSection">
        <div className="d3">
          <p>Country:</p>
          <p>District: </p>
          <p>City: </p>
          <p>Address: </p>
          <p>Postal Code: </p>
        </div>

        <div className="d4">
          <input type="text" value={user.Country || 'No details uploaded'} />
          <input type="text" value={user.District || 'No details uploaded'} />
          <input type="text" value={user.City || 'No details uploaded'} />
          <input type="text" value={user.Address || 'No details uploaded'} />
          <input type="text" value={user.postalCode || 'No details uploaded'} />
        </div>
      </div> */}
    </div>
    </div>

  );
};

export default UserDetails;
