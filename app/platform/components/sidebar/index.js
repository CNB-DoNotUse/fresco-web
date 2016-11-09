import React, { Component, PropTypes } from 'react';
import utils from 'utils';
import SidebarListItems from './list-items';

/**
 * Side bar object found across the site; inside of the top level App class
 */
class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
    }

    handleSearchKeyDown(e) {
        const { searchInput } = this.refs;

        if (e.keyCode !== 13 || searchInput.value === '') return;

        window.location = `/search?q=${encodeURIComponent(searchInput.value)}`;
    }

    render() {
        return (
            <div className="col-lg-2 sidebar toggle-drawer" id="_sidebar">
                <div>
                    <a href="/highlights">
                        <img
                            role="presentation"
                            src={`${utils.CDN}/images/wordmark-news.png`}
                        />
                    </a>

                    <input
                        className="search-input"
                        id="sidebar-search"
                        placeholder="Search"
                        type="text"
                        ref="searchInput"
                        defaultValue={this.props.query}
                        onKeyDown={this.handleSearchKeyDown}
                    />

                    <SidebarListItems user={this.props.user} />
                </div>
                <div>
                    <img
                        className="img-circle"
                        id="side-bar-avatar"
                        src={utils.formatImg(this.props.user.avatar, 'small') || utils.defaultSmallAvatar}
                        role="presentation"
                    />

                    <a className="md-type-title user-name-view" href="/user">
                        {this.props.user.full_name || this.props.user.username}
                    </a>

                    <ul>
                        <li><a href="/user/settings">Settings</a></li>
                        <li><a href="/scripts/user/logout">Log out</a></li>
                    </ul>
                </div>
            </div>
        );
    }
}

Sidebar.propTypes = {
    query: PropTypes.string,
    user: PropTypes.object,
};

Sidebar.defaultProps = {
    query: '',
};

export default Sidebar;

