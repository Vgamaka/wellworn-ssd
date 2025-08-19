import React from 'react';
import { PropagateLoader } from 'react-spinners';
import './Loading.scss'; // Import the associated styles

const Loading = () => {
  return (
    <div className="loading-container">
      <PropagateLoader color="#ff4500" />
    </div>
  );
};

export default Loading;
