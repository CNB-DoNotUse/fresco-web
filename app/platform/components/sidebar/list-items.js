import React, { PropTypes } from 'react';
import Item from './item';

const ListItems = ({ user }) => {
    if (!user) return null;

    let admin;
    let dispatch;
    let outlet;
    let purchases;
    let push;
    let stats;
    let moderation;

    if (user.outlet) {
        dispatch = <Item link="/dispatch" icon="mdi-map" text="Dispatch" />;
        outlet = <Item link="/outlet" icon="mdi-account-multiple" text={user.outlet.title} />;
    }
    if (user.roles.includes('admin')) {
        admin = <Item link="/admin" icon="mdi-dots-horizontal" text="Admin" />;
        push = <Item link="/push" icon="mdi-message-plus" text="Push" />;
        moderation = <Item link="/moderation" icon="mdi-flag-variant" text="Moderation" />;
    }
    if (user.roles.includes('admin')) {
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
                    icon="mdi-archive"
                    text="Stories"
                />
            </ul>

            {dispatch}
            {push}
            {admin}
            {moderation}
            {purchases}
            {stats}
            {outlet}
        </ul>
    );
};

ListItems.propTypes = {
    user: PropTypes.object,
};

export default ListItems;
