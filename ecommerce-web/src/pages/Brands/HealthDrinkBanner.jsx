
import React, { useState } from 'react';
import { IoChevronDown } from "react-icons/io5";
import boost from "../../assets/Product/Boost.svg";


  const categoriesData = [
  {
    id: 1,
    name: "Snacks",
    image: boost,
    brands: [
      { id: 1, name: "Lays", logo: boost },
      { id: 2, name: "Bingo", logo: boost },
    ],
    subCategories: [
      { id: 1, name: "Chips", image: boost },
      { id: 2, name: "Namkeen", image: boost },
    ],
  },
  {
    id: 2,
    name: "Beverages",
    image: boost,
    brands: [
      { id: 1, name: "Boost", logo: boost },
      { id: 2, name: "Horlicks", logo: boost },
    ],
    subCategories: [
      { id: 1, name: "Health Drinks", image: boost },
      { id: 2, name: "Soft Drinks", image: boost },
    ],
  },
];


const HealthDrinkBanner = ({
  title = "Health food drinks",
  imageUrl = "https://csspicker.dev/api/image/?q=health+drinks+bottles&image_type=photo"
}) => {

  const [open, setOpen] = useState(false);

  return (
    <div className="banner-wrapper">

     
      <div className="banner-container">
        <div className="banner-left">
          <div className="circle-bg">
            <img src={imageUrl} alt={title} className="product-image" />
          </div>
        </div>

        <div className="banner-content">
          <h2 className="banner-title">{title}</h2>
        </div>

        <div className="banner-right">
          <button
            className={`expand-button ${open ? 'rotate' : ''}`}
            onClick={() => setOpen(!open)}
          >
            <IoChevronDown size={20} color="#4caf50" />
          </button>
        </div>
      </div>

     
      {open && (
        <div className="dropdown">
          {categoriesData.map((brand, index) => (
            <div key={index} className="dropdown-item">
             <div >
                <img className='image-brand' src={brand.image} alt={brand.name}/>
                </div>
            </div>
          ))}
        </div>
      )}

      
      <style>{`
        .banner-wrapper {
          max-width: 800px;
        }

        .banner-container {
          display: flex;
          align-items: center;
          height: 72px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          overflow:hidden;
        }

        .banner-left {
          width: 129px;
          display: flex;
          justify-content: center;
        }

        .circle-bg {
          width: 117px;
          height: 117px;
          background-color: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        //   margin-top: 24px;
        }

        .product-image {
          width: 84px;
          height: 50px;
          margin-top:-35px;
          object-fit: contain;
        }

        .banner-content {
          flex: 1;
          padding-left: 20px;
        }

        .banner-title {
          font-size: 18px;
          font-weight: 600;
          white-space:nowrap
        }

        .banner-right {
          padding-right: 24px;
        }

        .expand-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .expand-button.rotate {
          transform: rotate(180deg);
        }

        .dropdown {
          margin-top: 8px;
          background: #fff;
          border-radius: 12px;
        display:grid;
        grid-template-columns:repeat(6,1fr);
        column-gap:20px;
        }

        .dropdown-item {
          padding: 12px 16px;
          cursor: pointer;
          font-weight: 500;
           border:1px solid rgba(97, 173, 78, 1);
           border-radius:10px;
           width:53px;
           height:53px          
        }

        .dropdown-item:hover {
          background-color: #f3f3f3;
          border:1px solid rgba(97, 173, 78, 1);
          
        }
          .image-brand{
          width:45px;
          height:34px;
          margin-left:-12px}
      `}</style>
    </div>
  );
};

export default HealthDrinkBanner;
