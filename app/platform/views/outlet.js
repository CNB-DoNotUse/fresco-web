import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from '../components/topbar';
import OutletBody from '../components/outlet/outlet-body';
import OutletBodyDemo from '../components/outlet/outlet-body-demo';

class Outlet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Vault',
            purchases: [],
        };

        this.setActiveTab = this.setActiveTab.bind(this);
    }

    setActiveTab(tab) {
        this.setState({ activeTab: tab });
    }

    edit() {
        window.location.href = '/outlet/settings';
    }

    render() {
        const { user, outlet } = this.props;
        let topbarTabs = [];
        let outletBody = null;

        // Only show purchases if outlet has been verified
        if (outlet.verified) {
            topbarTabs = ['Vault', 'Purchases'];
            outletBody = (
                <OutletBody
                    activeTab={this.state.activeTab}
                    outlet={outlet}
                    user={user}
                />
            );
        } else {
            outletBody = <OutletBodyDemo outlet={outlet} />;
        }

        return (
            <App user={user}>
                <TopBar
                    title={outlet.title}
                    rank={user.rank}
                    edit={this.edit}
                    editIcon={"mdi-settings"}
                    activeTab={this.state.activeTab}
                    setActiveTab={this.setActiveTab}
                    tabs={topbarTabs}
                    editable
                />
                {outletBody}
            </App>
        );
    }
}

Outlet.propTypes = {
    user: PropTypes.object,
    outlet: PropTypes.object.isRequired,
};

ReactDOM.render(
    <Outlet
        user={window.__initialProps__.user}
        outlet={window.__initialProps__.outlet}
    />,
    document.getElementById('app')
);
