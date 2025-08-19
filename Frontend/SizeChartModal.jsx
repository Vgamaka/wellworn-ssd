import React from 'react';
import './SizeChartModal.scss'; // Create this CSS file for styling

const SizeChartModal = ({ imgSrc, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">

        <img src={imgSrc} alt="Size Chart" className="size-chart-image" />
      </div>
    </div>
  );
};

export default SizeChartModal;
