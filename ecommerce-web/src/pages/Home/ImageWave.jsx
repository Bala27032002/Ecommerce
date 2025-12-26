import React from "react";
import "./ImageWave.css";

const ImageWave = () => {
  const columns = 20; // wave segments

  return (
    <div className="wave-wrapper">
      {[...Array(columns)].map((_, i) => (
        <div
          key={i}
          className="wave-segment"
          style={{
            animationDelay: `${i * 0.08}s`,
            backgroundPosition: `${(i / columns) * 100}% 0`
          }}
        />
      ))}
    </div>
  );
};

export default ImageWave;
