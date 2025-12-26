import React from 'react';
import Dove1 from '../../assets/Home-icons/Dove1.svg';
import Dove2 from '../../assets/Home-icons/Dove2.svg';

/* ---------------- Promo Card ---------------- */
const PromoCard = ({
  title = 'Body Lotion',
  discount = '7% OFF',
  primaryColor,
  secondaryColor,
  textColor,
  imageUrl1 = Dove1,
  imageUrl2 = Dove2
}) => {
  return (
    <div className="promo-card" style={{ backgroundColor: primaryColor }}>
      <div
        className="promo-wave"
        style={{ backgroundColor: secondaryColor }}
      />

      <div className="promo-inner">
        {/* LEFT CONTENT */}
        <div className="promo-left">
          <p className="promo-title" style={{ color: textColor }}>
            {title}
          </p>

          <p className="promo-discount">
            <span>UPTO</span>
            {discount}
          </p>
        </div>

        {/* RIGHT IMAGES */}
        <div className="promo-right">
          <img src={imageUrl1} alt="product-back" className="img-back" />
          <img src={imageUrl2} alt="product-front" className="img-front" />
        </div>
      </div>
    </div>
  );
};

/* ---------------- Big Deal Section ---------------- */
const BigDeal = () => {
  const promoData = [
    {
      primaryColor: '#B455C6',
      secondaryColor: '#F8D9FF',
      textColor: '#7A1FA2'
    },
    {
      primaryColor: '#0A6C3D',
      secondaryColor: '#E7F7EE',
      textColor: '#00B36B'
    },
    {
      primaryColor: '#0A6C3D',
      secondaryColor: '#E7F7EE',
      textColor: '#00B36B'
    },
    {
      primaryColor: '#B455C6',
      secondaryColor: '#F8D9FF',
      textColor: '#7A1FA2'
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="grid-layout">
        {promoData.map((item, index) => (
          <PromoCard
            key={index}
            primaryColor={item.primaryColor}
            secondaryColor={item.secondaryColor}
            textColor={item.textColor}
          />
        ))}
      </div>

      {/* ---------------- STYLES ---------------- */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        .page-wrapper {
          padding: 16px;
        }

        /* GRID */
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        /* CARD */
        .promo-card {
          position: relative;
          height: 130px;
          border-radius: 16px;
          overflow: hidden;
        }

        /* WAVE */
        .promo-wave {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 45%;
          border-bottom-right-radius: 100% 100%;
          z-index: 1;
        }

        /* INNER */
        .promo-inner {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          padding: 16px;
        }

        /* LEFT */
        .promo-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .promo-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
        }

        .promo-discount {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
        }

        .promo-discount span {
          display: block;
          font-size: 11px;
          font-weight: 600;
        }

        /* RIGHT */
        .promo-right {
          flex: 1;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .promo-right img {
          position: absolute;
          object-fit: contain;
        }

        .img-back {
          height: 85px;
          right: 38px;
          bottom: 6px;
          z-index: 1;
        }

        .img-front {
          height: 95px;
          right: 10px;
          bottom: -6px;
          transform: rotate(-4deg);
          z-index: 2;
        }

        /* MOBILE */
        @media (max-width: 600px) {
          .promo-card {
            height: 117px;
          }

          .promo-title {
            font-size: 14px;
          }

          .promo-discount {
            font-size: 14px;
          }

          .img-back {
            height: 60px;
            right: 28px;
          }

          .img-front {
            height: 70px;
          }
        }
      `}</style>
    </div>
  );
};

export default BigDeal;
