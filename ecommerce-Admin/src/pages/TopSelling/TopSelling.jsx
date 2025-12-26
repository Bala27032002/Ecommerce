import React from 'react'
import './TopSelling.css'
import salt from '../../assets/Navbar-icons/salt.svg'
import dummy from '../../assets/Navbar-icons/dummy.svg'
const TopSelling = () => {
  return (
    <div className="top-selling">

 
  <div className="card">
    <div className="see-all">
      <h3>Top Selling Stock</h3>
      <p>See All</p>
    </div>

    <div className="selling-stock">
      <table className="stock-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Sold Qty</th>
      <th>Remaining Qty</th>
      <th>Price</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Surf Excel</td>
      <td>30</td>
      <td>12</td>
      <td>₹100</td>
    </tr>
    <tr>
      <td>Rin</td>
      <td>21</td>
      <td>15</td>
      <td>₹207</td>
    </tr>
    <tr>
      <td>Parle G</td>
      <td>19</td>
      <td>17</td>
      <td>₹105</td>
    </tr>
  </tbody>
</table>

    </div>
  </div>

 
  <div className="card">
    <div className="see-all">
      <h3>Low Quantity Stock</h3>
      <p>See All</p>
    </div>
    <div>
    <div className="low-stock">
      <img src={dummy} alt="dummys" />

      <div className="rate-dummys">
        <div>
        <p className="item-names">Chicken</p>
        <p className="item-units">50 units</p>
        </div>
       
        <p className="item-alert">low</p>
      </div>
    </div>
    <div className="low-stock">
      <img src={dummy} alt="dummys" />

      <div className="rate-dummys">
        <div>
        <p className="item-names">Chicken</p>
        <p className="item-units">50 units</p>
        </div>
       
        <p className="item-alert">low</p>
      </div>
    </div>
    <div className="low-stock">
      <img src={dummy} alt="dummys" />

      <div className="rate-dummys">
        <div>
        <p className="item-names">Chicken</p>
        <p className="item-units">50 units</p>
        </div>
       
        <p className="item-alert">low</p>
      </div>
    </div>
    <div className="low-stock">
      <img src={dummy} alt="dummys" />

      <div className="rate-dummys">
        <div>
        <p className="item-names">Chicken</p>
        <p className="item-units">50 units</p>
        </div>
       
        <p className="item-alert">low</p>
      </div>
    </div>
  </div>
  </div>

</div>

  )
}

export default TopSelling