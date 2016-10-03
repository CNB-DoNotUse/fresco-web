import React, { PropTypes } from 'react';
import partial from 'lodash/partial';

class TopBar extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        tabs: PropTypes.array.isRequired,
        setActiveTab: PropTypes.func.isRequired,
        activeTab: PropTypes.string.isRequired,
        onFilter: PropTypes.func.isRequired,
    };

	/**
	 * Toggles the sidebar from hidden to showing
	 */
    toggleDrawer() {
        const sidebar = document.getElementById('_sidebar');
        const toggler = document.getElementById('_toggler');

        if (sidebar.className.indexOf('toggled') > -1) {
            // Remove toggled class
            $(sidebar).removeClass('toggled');
            $(toggler).removeClass('toggled');
        } else {
            // Add toggled class
            sidebar.className += ' toggled';
            toggler.className += ' toggled';
        }
    }

    renderTabs() {
        const {
            tabs,
            setActiveTab,
            activeTab,
        } = this.props;

        if (tabs) {
            const tabContent = tabs.map((tab) => (
                <button
                    className={`btn btn-flat vault ${tab.toLowerCase()}-toggler
                        ${activeTab.toLowerCase() === tab.toLowerCase() ? 'toggled' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    key={tab.toLowerCase()}
                >
                    {tab}
                    <div className="ripple-wrapper" />
                </button>
            ));

            return <div className="tab-control">{tabContent}</div>;
        }

        return '';
    }

    renderFilters() {
        const { onFilter } = this.props;

        return (
            <div className="moderation-topbar__filters">
                <span
                    className="moderation-topbar__filter"
                    onClick={partial(onFilter, 'spam')}
                >
                    spam
                </span>
                <span
                    className="moderation-topbar__filter"
                    onClick={partial(onFilter, 'abusive')}
                >
                    abusive
                </span>
                <span
                    className="moderation-topbar__filter"
                    onClick={partial(onFilter, 'graphic')}
                >
                    graphic
                </span>
                <span
                    className="moderation-topbar__filter"
                    onClick={partial(onFilter, 'stolen')}
                >
                    stolen
                </span>

                <button className="btn btn-raised moderation-topbar__suspended">
                    suspended
                </button>
            </div>
        );
    }

    render() {
        const { title } = this.props;

        return (
            <nav className="navbar navbar-fixed-top navbar-default">
                <div
                    className="dim toggle-drop toggler"
                    id="_toggler"
                    onClick={() => this.toggleDrawer()}
                />

                <button
                    type="button"
                    className="icon-button toggle-drawer toggler hidden-lg"
                    onClick={() => this.toggleDrawer()}
                >
                    <span className="mdi mdi-menu icon" />
                </button>

                <div className="spacer" />

                {title ? <h1 className="md-type-title">{title}</h1> : ''}

                {this.renderTabs()}

                {this.renderFilters()}
            </nav>
        );
    }

}

export default TopBar;
