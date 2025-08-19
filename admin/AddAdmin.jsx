import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddAdmin.scss';
import Notification from './Notification';

const apiUrl = import.meta.env.VITE_BACKEND_API;

function AddAdmin() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    password: "",
    rePassword: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? e.target.checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.rePassword) {
      toast.error("Passwords Mismatched");
      return;
    }

    try {
      const { firstName, lastName, email, contact, password, role } = formData;
      const response = await axios.post(
        `https://wellworn-4.onrender.com/api/register`,
        { firstName, lastName, email, contact, password, role }
      );

      console.log("Response:", response.data.customer);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        password: "",
        rePassword: "",
        role: "",
      });
      setError("");

      // Show success toast message
      toast.success("User registered successfully!");
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while registering.");
      toast.error("Registration failed! Please try again.");
    }
  };

  return (
    <div>
      <Notification />
      <ToastContainer /> {/* Add this to enable toast messages */}
      <div className="regmtitle11">ADMIN REGISTRATION</div>

      <div className="uregmallitems11">
        <form className="form11" onSubmit={handleSubmit}>
          <div className="regfitems11">
            <div>
              <input
                className="regfminputs11"
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>
            <div>
              <input
                className="regfminputs11"
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                className="regfminputs11"
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                className="regfminputs11"
                type="tel"
                id="contact"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                className="regfminputs11"
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                className="regfminputs11"
                type="password"
                id="rePassword"
                name="rePassword"
                placeholder="Re-Enter Password"
                value={formData.rePassword}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <select
                className="regfminputs11"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button type="submit" className="remubtn11">
              Register
            </button>
          </div>
        </form>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default AddAdmin;
