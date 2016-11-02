import React from 'react';
import List from './list';
import Stats from './stats';

const ListWithStats = (props) => (
    <div className="container-fluid fat grid">
        <List {...props} />
        <Stats {...props} />
    </div>
);

export default ListWithStats;
