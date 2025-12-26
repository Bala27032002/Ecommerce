import React from 'react';
import { Sparkles } from 'lucide-react';

const BigSaleBanner = (props) => {
  const {
    text = "BIG SALE",
    primaryColor = "#d946ef",
    secondaryColor = "#7e22ce",
  } = props;

  const letters = text.split("");

  return (
    <div className="sale-container">
      <div className="wave-container">
        <h1 className="wave-text">
          {letters.map((char, index) => (
            <span
              key={index}
              className="letter"
              style={{
                animationDelay: `${index * 0.1}s`,
                marginRight: char === " " ? "0.5rem" : "0",
              }}
            >
              {char === " " ? "\u00A0" : char}

              {index === 2 && (
                <Sparkles className="sparkle-icon top-left" size={20} />
              )}
              {index === 6 && (
                <Sparkles className="sparkle-icon bottom-right" size={18} />
              )}
            </span>
          ))}
        </h1>

        {/* Decorations */}
     
      </div>

      <style>{`
        .sale-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          width: 100%;
          background: #fff;
          overflow: hidden;
          font-family: 'Arial Black', 'Arial Bold', sans-serif;
        }

        .wave-container {
          position: relative;
          padding: 2rem;
        }

        .wave-text {
          display: flex;
          margin: 0;
          padding: 0;
          perspective: 500px;
        }

        .letter {
          display: inline-block;
          font-size: 5rem;
          font-weight: 900;
          font-style: italic;
          background: linear-gradient(
            to bottom,
            #f5d0fe 0%,
            ${primaryColor} 50%,
            ${secondaryColor} 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          position: relative;
          filter: drop-shadow(4px 4px 0px #4c1d95);
          animation: wave 2s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .sparkle-icon {
          position: absolute;
          color: #fdf4ff;
          filter: drop-shadow(0 0 5px #fff);
          z-index: 10;
        }

        .top-left {
          top: -10px;
          left: -10px;
        }

        .bottom-right {
          bottom: -5px;
          right: -5px;
        }

        .decoration {
          position: absolute;
          font-size: 1.5rem;
          pointer-events: none;
        }

        .ribbon-1 { top: 0; left: 20%; transform: rotate(-15deg); }
        .star-1 { top: -10px; right: 25%; transform: rotate(20deg); }
        .ribbon-2 { bottom: 10px; left: 10%; transform: rotate(10deg); }
        .star-2 { bottom: 0; right: 15%; }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0) rotateX(0deg);
          }
          50% {
            transform: translateY(-30px) rotateX(10deg);
          }
        }

        @media (max-width: 640px) {
          .letter {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BigSaleBanner;
    