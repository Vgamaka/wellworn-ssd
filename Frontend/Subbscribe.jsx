import { useState } from 'react';
import subimg from '../src/assets/sub.jpg';
import { toast } from 'react-toastify';
import './Subbbscribe.scss';
import { FaTimes } from 'react-icons/fa';

const Subbscribe = ({ onClose }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Thank you for subscribing!');
        onClose();
    };

    return (
        <div className="subscription-popup">
            <div className="popup-background" onClick={onClose}></div>
            <div className="popup-containerz">
                <button className="close-button" onClick={onClose}><FaTimes /></button>
                <img src={subimg} alt="Subscribe" className="subscription-image" />
                <div className="popup-contenttz">
                    <h2>Subscribe Now!</h2>
                    <p>Enter your email to stay updated:</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="subscribe-button">Subscribe</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Subbscribe;
