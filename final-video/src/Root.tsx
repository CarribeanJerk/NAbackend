import React from 'react';
import { Composition } from 'remotion';
import VideoComponent from './Composition'; // Import VideoComponent directly

const Root: React.FC = () => {
  const videoSrc = '/home/joshs/NAbackend/final-video/public/hedra-output-fixed.mp4'; // Adjust the path if necessary

  return (
    <Composition
      id="MyComp"
      component={VideoComponent} // Pass the VideoComponent here directly
      width={896}
      height={512}
      fps={30}
      durationInFrames={1440}
      defaultProps={{ videoSrc }} // Pass the videoSrc to the component
    />
  );
};

export default Root;