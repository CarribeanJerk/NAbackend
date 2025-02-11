import React from 'react';

const VideoComponent: React.FC<{ videoSrc: string }> = ({ videoSrc }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Video Source: {videoSrc}</h2>
      <video width="896" height="512" controls autoPlay muted>
        <source src={videoSrc} type="video/mp4" />
        <p>Your browser does not support the video tag or the video failed to load.</p>
      </video>
    </div>
  );
};

export default VideoComponent;
