import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from './../components/topbar/topbar-admin';
import AdminBody from './../components/admin/admin-body';
import difference from 'lodash/difference';

/**
 * Admin Page Component (composed of Admin Component and Navbar)
*/

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '',
            assignments: [],
            submissions: [],
            imports: [],
        };

        this.currentXHR = null;
        this.clearXHR = this.clearXHR.bind(this);

        this.setTab = this.setTab.bind(this);

        this.getChangedData = this.getChangedData.bind(this);

        this.getData = this.getData.bind(this);

        this.resetAssignments = this.resetAssignments.bind(this);
        this.resetSubmissions = this.resetSubmissions.bind(this);
        this.resetImports = this.resetImports.bind(this);

        this.spliceGallery = this.spliceGallery.bind(this);

        this.refresh = this.refresh.bind(this);
        this.refreshInterval = null;
    }

    componentDidMount() {
        this.refreshInterval = setInterval(() => {
            if (this.props.activeTab !== '') this.refresh();
        }, 5000);
        this.loadInitial();
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.state.activeTab && prevState.activeTab) && (prevState.activeTab !== this.state.activeTab)) {
            this.clearXHR();

            switch (this.state.activeTab) {
                case 'assignments':
                    this.resetAssignments();
                    break;
                case 'submissions':
                    this.resetSubmissions();
                    break;
                case 'imports':
                    this.resetImports();
                    break;
                default:
                    break;
            }
        }
    }

    setTab(tab) {
        if (tab === this.state.activeTab) return;

        this.setState({ activeTab: tab });
    }

    getChangedData(newGalleries, currentGalleries) {
        const newIDs = newGalleries.map(n => n.id);
        const curIDs = currentGalleries.map(c => c.id);
        const diffIds = difference(newIDs, curIDs);
        const diffGalleries = [];

        for (let x in newGalleries) {
            if (diffIds.indexOf(newGalleries[x].id) !== -1) {
                diffGalleries.push(newGalleries[x]);
            }

            if (diffIds.length === diffGalleries.length) break;
        }

        return diffGalleries;
    }

    getData(last, options, cb) {
        const self = this;
        const tab = options.tab || this.state.activeTab;
        const newState = {};
        let params = {};
        let endpoint = '';
        let concat = false;
        let unshift = false;

        // Set up endpoint and params depending on tab
        switch (tab) {
            case 'assignments':
                endpoint = '/api/assignment/list';
                params = { pending: true, limit: 16, last: last };
                break;
            case 'submissions':
                endpoint = '/api/gallery/submissions';
                params = { last: last, limit: 16 };
                break;
            case 'imports':
                endpoint = '/api/gallery/imports';
                params = { last: last, limit: 16, rated: 0 };
                break;
            default:
                break;
        }

        if (typeof cb === 'undefined') {
            cb = options;
        } else if (options.concat) {
            concat = true;
        } else if (options.unshift) {
            unshift = true;
        }

        this.currentXHR = $.get(endpoint, params, (data) => {
            if (!data.data) {
                return cb([]);
            }

            let stateData = this.state[tab];
            if (!stateData.length) {
                const state = {};
                state[tab] = data.data;
                if (unshift) self.setState(state);

                return cb(data.data);
            }

            const newData = this.getChangedData(stateData.concat(data.data), stateData);
            if (!newData.length) {
                return cb([]);
            }

            if (concat || unshift) {
                if (concat) stateData = stateData.concat(data.data);

                if (unshift) {
                    if (stateData.length) {
                        // Filter posts newer than newest
                        for (let i = 0; i < newData.length; i++) {
                            if (newData[i].created_at < stateData[0].created_at) {
                                newData.splice(i, 1);
                            }
                        }
                    }
                    stateData.unshift(...newData);
                }

                newState[tab] = stateData;
                self.setState(newState);
            }

            return cb(data.data);
        });
    }

    /**
     * Clear any pending XHR requests
     */
    clearXHR() {
        if (this.currentXHR != null) {
            this.currentXHR.abort();
            this.currentXHR = null;
        }
    }

    /**
     * Query for initial data. Set the active tab to a tab with data.
     */
    loadInitial() {
        let activeTab = 'submissions';

        this.getData(undefined, { tab: 'assignments' }, (assignments) => {
            activeTab = 'assignments';
            this.setState({
                assignments: this.state.assignments.concat(assignments),
            });
        });

        this.getData(undefined, { tab: 'submissions' }, (submissions) => {
            activeTab = 'submissions';
            this.setState({
                submissions: this.state.submissions.concat(submissions),
            });
        });


        this.getData(undefined, { tab: 'imports' }, (imports) => {
            this.setState({
                activeTab: imports.length ? 'imports' : activeTab,
                imports: this.state.imports.concat(imports),
            });
        });
    }


    spliceGallery(data, cb) {
        const stateData = this.state[data.type];
        let index = 0;

        for (let g in stateData) {
            if (stateData[g].id === data.gallery) {
                index = g;
                break;
            }
        }

        stateData.splice(index, 1);
        this.setState(stateData);

        cb(null, index);
    }

    refresh() {
        this.getData(undefined, { unshift: true, tab: this.state.activeTab }, () => {});
    }

    resetAssignments() {
        this.getData(undefined, { tab: 'assignments' }, (assignments) => {
            this.setState({
                activeTab: 'assignments',
                assignments: assignments.length ? assignments : this.state.assignments,
            });
        });
    }

    resetSubmissions() {
        this.getData(undefined, { tab: 'submissions' }, (submissions) => {
            this.setState({
                activeTab: 'submissions',
                submissions: submissions.length ? submissions : this.state.submissions,
            });
        });
    }

    resetImports() {
        this.getData(undefined, { tab: 'imports' }, (imports) => {
            this.setState({
                activeTab: 'imports',
                imports: imports.length ? imports : this.state.imports,
            });
        });
    }

    render() {
        return (
            <App user={this.props.user}>
                <TopBar
                    activeTab={this.state.activeTab}
                    resetImports={this.resetImports}
                    setTab={this.setTab}
                />
                <AdminBody
                    activeTab={this.state.activeTab}
                    assignments={this.state.assignments}
                    submissions={this.state.submissions}
                    imports={this.state.imports}
                    getData={this.getData}
                    refresh={this.refresh}
                    spliceGallery={this.spliceGallery}
                />
            </App>
        );
    }
}

Admin.propTypes = {
    activeTab: PropTypes.string,
    user: PropTypes.object,
};

ReactDOM.render(
    <Admin user={window.__initialProps__.user} />,
    document.getElementById('app')
);
