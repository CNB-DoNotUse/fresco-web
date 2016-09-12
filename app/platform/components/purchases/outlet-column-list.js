import React, { PropTypes } from 'react';
import OutletColumnPurchase from './outlet-column-purchase';

/**
 * Outlet Column Purchase List parent component
 */
const OutletColumnList = ({ scroll, purchases }) => (
    <ul className="outlet-column__list" onScroll={scroll}>
        {purchases.map((purchase, i) => (
            <OutletColumnPurchase purchase={purchase} key={i} />
        ))}
    </ul>
);

OutletColumnList.propTypes = {
    scroll: PropTypes.func.isRequired,
    purchases: PropTypes.array.isRequired,
};

export default OutletColumnList;
