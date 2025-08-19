import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import './OrderConfirmationModal.scss';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext'; // Import the CartContext
import { useCurrency } from '../CurrencyContext'; // Use the CurrencyContext

Modal.setAppElement('#root');

const OrderConfirmationModal = ({
    isOpen,
    orderDetails,
    checkoutSource,
    onContinue,
    onDownload,
}) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(10); // Countdown timer in seconds
    const timerRef = useRef(null);
    const isPaused = useRef(false);
    const { refreshCart } = useCart();
    const [isCartCleared, setIsCartCleared] = useState(false);

    const { currency, exchangeRate } = useCurrency(); // Use CurrencyContext

    const startTimer = () => {
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;

                        // Navigate after countdown finishes
                        onContinue(); // Explicitly call the parent callback
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    };

    const handleCartClear = async () => {
        if (checkoutSource === 'cart' && !isCartCleared) {
            await refreshCart(); // Clear cart when modal opens if order placed via cart
            setIsCartCleared(true);
        }
    };

    const pauseTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        isPaused.current = true;
    };

    const resumeTimer = () => {
        if (isPaused.current) {
            isPaused.current = false;
            startTimer();
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleCartClear();
            startTimer();
        }

        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [isOpen]);

    const convertCurrency = (priceInLKR) => {
        return currency === 'USD' ? (priceInLKR / exchangeRate).toFixed(2) : priceInLKR.toFixed(2);
    };

    return (
        <Modal
            isOpen={isOpen}
            className="order-confirmation-modalz"
            overlayClassName="order-confirmation-overlayz"
            shouldCloseOnOverlayClick={false} // Prevent accidental background clicks
        >
            <div
                className="modal-contentz"
                onMouseEnter={pauseTimer} // Pause timer on hover
                onMouseLeave={resumeTimer} // Resume timer on mouse leave
                onTouchStart={pauseTimer} // Pause timer on touch (for mobile)
                onTouchEnd={resumeTimer} // Resume timer when touch ends
            >
                <div className="modal-headerz">
                    <FaCheckCircle className="success-iconz" />
                    <h2>Payment Successful</h2>
                    <p>Thank you! Your payment has been processed.</p>
                </div>
                <div className="order-idz">Order ID: {orderDetails?.orderId ?? 'N/A'}</div>
                <h3>Payment Details</h3>
                <div className="payment-detailsz">
                    <p><strong>Country:</strong> <span>{orderDetails?.country ?? 'N/A'}</span></p>
                    <p><strong>Name:</strong> <span>{orderDetails?.firstName ?? 'N/A'} {orderDetails?.lastName ?? 'N/A'}</span></p>
                    <p><strong>Contact:</strong> <span>{orderDetails?.contactNumber ?? 'N/A'}</span></p>
                    <p><strong>Address:</strong> <span>{orderDetails?.address ?? 'N/A'}, {orderDetails?.State ?? 'N/A'}, {orderDetails?.city ?? 'N/A'}</span></p>
                    <p><strong>Postal Code:</strong> <span>{orderDetails?.postalCode ?? 'N/A'}</span></p>
                    <p><strong>Total Amount:</strong> <span>
                        {currency === 'USD'
                            ? `$${convertCurrency(orderDetails?.total || 0)}`
                            : `LKR ${orderDetails?.total ?? 'N/A'}`}
                    </span></p>
                </div>
                <div className="modal-buttonsz">
                    <button
                        onClick={onContinue}
                        className="continue-buttonz"
                    >
                        Continue Shopping
                    </button>
                </div>
                <div className="countdown-message">
                    Redirecting to the home page in <strong>{timeLeft}</strong> seconds...
                </div>
            </div>
        </Modal>
    );
};

export default OrderConfirmationModal;
