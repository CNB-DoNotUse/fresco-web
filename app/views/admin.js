import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from './../components/topbar/topbar-admin';
import Assignments from './../components/admin/assignments';
import Imports from './../components/admin/imports';
import Submissions from './../components/admin/submissions';
import difference from 'lodash/difference';
import remove from 'lodash/remove';

/**
 * Admin Page Component (composed of Admin Component and Navbar)
*/

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'assignments',
            assignments: {},
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

    getData(last, options, callback) {
        const self = this;
        const tab = options.tab || this.state.activeTab;
        const newState = {};
        let params = {};
        let endpoint = '';
        let concat = false;
        let unshift = false;
        let cb = callback;

        // Set up endpoint and params depending on tab
        switch (tab) {
            case 'assignments':
                endpoint = '/api/assignment/find';
                params = { unrated: true, last, limit: 16 };
                break;
            case 'submissions':
                endpoint = '/api/gallery/list';
                params = { unrated: true, last, limit: 16 };
                break;
            case 'imports':
                endpoint = '/api/gallery/list';
                params = { imported: true, last, limit: 16 };
                break;
            default:
                break;
        }

        if (typeof cb !== 'function') {
            cb = typeof(options) === 'function' ? options : () => {};
        } else if (options.concat) {
            concat = true;
        } else if (options.unshift) {
            unshift = true;
        }

        this.currentXHR = $.get(endpoint, params, (data) => {
            if (!data) {
                return cb([]);
            }

            let stateData = this.state[tab];
            if (!stateData.length) {
                const state = {};
                state[tab] = data;
                if (unshift) self.setState(state);

                return cb(data);
            }

            const newData = this.getChangedData(stateData.concat(data), stateData);
            if (!newData.length) {
                return cb([]);
            }

            if (concat || unshift) {
                if (concat) stateData = stateData.concat(data);

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

            return cb(data);
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
            this.setState({ assignments });
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


    removeAssignment(id) {
        const { assignments } = this.state;

        if (!assignments) return;
        if (assignments.global) assignments.global = remove(assignments.global, { id });
        if (assignments.nearby) assignments.nearby = remove(assignments.nearby, { id });

        this.setState({ assignments });
    }

    removeImport(id) {
        const { imports } = this.state;

        if (!imports) return;
        this.setState({ imports: remove(imports, { id }) });
    }

    removeSubmission(id) {
        const { submissions } = this.state;

        if (!submissions) return;
        this.setState({ submissions: remove(submissions, { id }) });
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

    renderActiveTab() {
        let tab = '';

        switch (this.state.activeTab) {
            case 'assignments':
                tab = (
                    <Assignments
                        assignments={this.state.assignments}
                        getData={this.getData}
                        refresh={this.refresh}
                        removeAssignment={(id) => this.removeAssignment(id)}
                    />
                );
                break;
            case 'submissions':
                tab = (
                    <Submissions
                        submissions={this.state.submissions}
                        getData={this.getData}
                        refresh={this.refresh}
                        removeSubmission={(id) => this.removeSubmission(id)}
                    />
                );
                break;
            case 'imports':
                tab = (
                    <Imports
                        imports={this.state.imports}
                        getData={this.getData}
                        refresh={this.refresh}
                        removeImport={(id) => this.removeImport(id)}
                    />
                );
                break;
            default:
                break;
        }

        return tab;
    }

    render() {
        let activeTab = this.renderActiveTab();

        return (
            <App user={this.props.user}>
                <TopBar
                    activeTab={this.state.activeTab}
                    resetImports={this.resetImports}
                    setTab={this.setTab}
                />

                {activeTab}
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

