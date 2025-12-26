import React from "react";
import "./DealAnimation.css";

const BestDealAnimation = () => {
  const text = "BEST DEAL FOR YOU";

  return (
    <div className="best-deal-header">
      <ul className="container" >
        {text.split("").map((char, index) => (
          <li
            key={index}
            style={{ "--i": `${1 + index * 0.25}` }}
            className="letter"
          >
            {char === " " ? "\u00A0" : char}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BestDealAnimation;
