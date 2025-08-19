import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Faqemail.scss'; // Import the external CSS file
import Notification from './Notification';
import Loading from './Loading'; // Import reusable Loading component

const apiUrl = import.meta.env.VITE_BACKEND_API;

const Faqemail = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { faqId } = useParams(); // Extract faqId from the URL params
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchFaqDetails = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        const response = await axios.get(`https://wellworn-4.onrender.com/api/faq/${faqId}`);
        const faq = response.data.faq;
        setCustomerEmail(faq.CustomerEmail);
        setQuestion(faq.Question);
      } catch (error) {
        console.error('Error fetching FAQ details:', error);
        toast.error('There was an error fetching the FAQ details. Please try again later.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchFaqDetails();
  }, [faqId]);

  const handleSendEmail = async () => {
    const emailData = {
      customerEmail,
      question,
      answer,
    };
    setLoading(true); // Set loading to true before sending email

    try {
      await axios.post(`${apiUrl}/api/send-faq`, emailData); // Note the `/api` prefix
      toast.success("Email sent successfully");
  
      setCustomerEmail("");
      setQuestion("");
      setAnswer("");
    } catch (error) {
      console.error("Error sending email:", error.response || error.message);
      toast.error("There was an error sending the email. Please try again later.");
    } finally {
      setLoading(false); // Set loading to false after email is sent
    }
  };
  
  if (loading) {
    return <Loading />; // Show the Loading component while loading
  }
  return (
    <div>
      <Notification/>
      <div className="emailtopicpath-faq">
        
        FAQ Email Section (FAQ ID: {faqId})
      </div>
      {/* <button onClick={() => navigate('/admin/faq')} className="back-button-faq">
        Back to FAQs
      </button> */}
      <div className="container-faq">
        <div className="form-faq">
          <div className="form-header-faq">Customer FAQ Email</div>
          <div>
            <div style={{ marginBottom: "12px" }}>
              <label className="label-faq">Customer Email</label>
              <input
                type="email"
                placeholder="Customer's Email Address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input-faq"
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label className="label-faq">Question</label>
              <input
                type="text"
                placeholder="Enter the question.."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input-faq"
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label className="label-faq">Answer</label>
              <textarea
                placeholder="Enter the answer.."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="input-faq"
                style={{ minHeight: "100px" }}
              />
            </div>
            <div style={{ textAlign: "center"}}>
              <button style={{fontSize:"20px",paddingTop:"12px",paddingBottom:"12px",marginTop:"20px"}}
                className={`button-faq ${isHovered ? 'hover' : ''}`}
                onClick={handleSendEmail}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Faqemail;
