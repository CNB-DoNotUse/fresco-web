import React, { PropTypes } from 'react';
import OutletColumnPurchase from './outlet-column-purchase';

/**
 * Outlet Column Purchase List parent component
 */
const OutletColumnList = ({ onScroll, purchases }) => (
    <ul className="outlet-column__list" onScroll={onScroll}>
        {purchases.map((purchase, i) => (
            <OutletColumnPurchase purchase={purchase} key={i} />
        ))}
    </ul>
);

OutletColumnList.propTypes = {
    onScroll: PropTypes.func.isRequired,
    purchases: PropTypes.array.isRequired,
};

export default OutletColumnList;
