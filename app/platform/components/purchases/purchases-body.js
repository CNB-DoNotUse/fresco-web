import React, { PropTypes } from 'react';
import PurchasesList from './purchases-list';
import PurchasesStats from './purchases-stats';

const PurchasesBody = ({
    updatePurchases,
    loadPurchases,
    downloadExports,
    loadStats }) => (
    <div className="container-fluid fat grid">
        <PurchasesList
            updatePurchases={updatePurchases}
            loadPurchases={loadPurchases}
        />

        <PurchasesStats
            downloadExports={downloadExports}
            loadStats={loadStats}
            updatePurchases={updatePurchases}
        />
    </div>
);

PurchasesBody.propTypes = {
    updatePurchases: PropTypes.bool,
    loadPurchases: PropTypes.func,
    downloadExports: PropTypes.func,
    loadStats: PropTypes.func,
};

PurchasesBody.defaultProps = {
    downloadExports: () => {},
    updatePurchases: false,
};

export default PurchasesBody;

