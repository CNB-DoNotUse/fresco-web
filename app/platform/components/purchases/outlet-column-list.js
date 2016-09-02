import React from 'react';
import OutletColumnPurchase from './outlet-column-purchase';

/**
 * Outlet Column Purchase List parent component
 */
const OutletColumnList = () => (
    <ul className="purchases" onScroll={this.props.scroll}>
        {this.props.purchases.map((purchase, i) => (
            <OutletColumnPurchase purchase={purchase} key={i} />
        ))}
    </ul>
);

export default OutletColumnList;
