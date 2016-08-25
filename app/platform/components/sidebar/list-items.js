import React, { PropTypes } from 'react';
import Item from './item';

const ListItems = ({ user }) => {
    if (!user) return null;

    let admin = null;
    let dispatch = null;
    let outlet = null;
    let purchases = null;
    let push = null;
    let stats = null;

    if (user.outlet) {
        dispatch = <Item link="/dispatch" icon="mdi-map" text="Dispatch" />;
        outlet = <Item link="/outlet" icon="mdi-account-multiple" text={user.outlet.title} />;
    }
    if (user.permissions.includes('update-other-content')) {
        admin = <Item link="/admin" icon="mdi-dots-horizontal" text="Admin" />;
        push = <Item link="/pushNotifs" icon="mdi-message-plus" text="Push Notifications" />;
    }
    if (user.permissions.includes('get-all-purchases')) {
        purchases = <Item link="/purchases" icon="mdi-currency-usd" text="Purchases" />;
        stats = <Item link="/stats" icon="mdi-chart-line" text="Stats" />;
    }

    return (
        <ul className="md-type-body1 master-list">
            <Item
                link="/highlights"
                icon="mdi-star"
                text="Highlights"
            />

            <Item
                link="/archive"
                icon="mdi-play-box-outline"
                text="Archive"
            />

            <ul>
                <Item
                    link="/archive/photos"
                    icon="mdi-image"
                    text="Photos"
                />

                <Item
                    link="/archive/videos"
                    icon="mdi-movie"
                    text="Videos"
                />

                <Item
                    link="/archive/galleries"
                    icon="mdi-image-multiple"
                    text="Galleries"
                />

                <Item
                    link="/archive/stories"
                    icon="mdi-newspaper"
                    text="Stories"
                />
            </ul>

            {dispatch}
            {outlet}
            {admin}
            {purchases}
            {stats}
            {push}
        </ul>
    );
};

ListItems.propTypes = {
    user: PropTypes.object,
};

export default ListItems;

