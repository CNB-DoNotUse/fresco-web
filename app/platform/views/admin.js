import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from './../components/admin/topbar';
import Assignments from './../components/admin/assignments';
import Galleries from './../components/admin/galleries';
import difference from 'lodash/difference';
import 'app/sass/platform/_admin';

/**
 * Admin Page Component (composed of Admin Component and Navbar)
*/
class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'assignments',
            assignments: [],
            submissions: [],
            imports: [],
        };
        this.currentXHR = null;
    }

    componentDidMount() {
        setInterval(() => {
            if (this.props.activeTab !== '') this.refresh();
        }, 5000);
        this.loadInitial();
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.state.activeTab && prevState.activeTab)
            && (prevState.activeTab !== this.state.activeTab)) {
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
            endpoint = '/api/assignment/list';
            params = { rating: 0, last, limit: 16 };
            break;
        case 'submissions':
            endpoint = '/api/gallery/list';
            params = { rating: 0, last, limit: 16 };
            break;
        case 'imports':
            endpoint = '/api/gallery/list';
            params = { rating: 0, imported: true, last, limit: 16 };
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
            if (!stateData || !stateData.length) {
                const state = {};
                state[tab] = data;
                if (unshift) self.setState(state);

                return cb(data);
            }

            const newData = this.getChangedData(stateData.concat(data), stateData);
            if (!newData || !newData.length) {
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

    getAssignments() {
        const { assignments } = this.state;
        if (!assignments) return [];
        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        return assignments.sort(sortListItem);
    }

    getSubmissions() {
        return this.state.submissions.filter((s) => (
            s.posts && s.posts.length
        ));
    }

    getImports() {
        return this.state.imports.filter((s) => (
            s.posts && s.posts.length
        ));
    }

    removeAssignment(id, cb) {
        const { assignments } = this.state;
        if (!id || !assignments || !cb) return;

        this.setState({ assignments: assignments.filter(a => a.id !== id) },
            () => cb(this.state.assignments));
    }

    removeImport(id, cb) {
        const { imports } = this.state;
        if (!id || !imports || !cb) return;

        this.setState({ imports: imports.filter(a => a.id !== id) },
            () => cb(this.state.imports));
    }

    removeSubmission(id, cb) {
        const { submissions } = this.state;
        if (!id || !submissions || !cb) return;

        this.setState({ submissions: submissions.filter(a => a.id !== id) },
            () => cb(this.state.submissions));
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

    /**
     * Clear any pending XHR requests
     */
    clearXHR() {
        if (this.currentXHR != null) {
            this.currentXHR.abort();
            this.currentXHR = null;
        }
    }

    renderActiveTab() {
        let tab = '';

        switch (this.state.activeTab) {
        case 'assignments':
            tab = (
                <Assignments
                    assignments={this.getAssignments()}
                    getData={(l, o, cb) => this.getData(l, o, cb)}
                    refresh={() => this.refresh()}
                    removeAssignment={(id, cb) => this.removeAssignment(id, cb)}
                />
            );
            break;
        case 'submissions':
            tab = (
                <Galleries
                    galleries={this.getSubmissions()}
                    getData={(l, o, cb) => this.getData(l, o, cb)}
                    refresh={() => this.refresh()}
                    removeGallery={(id, cb) => this.removeSubmission(id, cb)}
                    galleryType="submissions"
                />
            );
            break;
        case 'imports':
            tab = (
                <Galleries
                    galleries={this.getImports()}
                    getData={(l, o, cb) => this.getData(l, o, cb)}
                    refresh={() => this.refresh()}
                    removeGallery={(id, cb) => this.removeImport(id, cb)}
                    galleryType="imports"
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
                    resetImports={() => this.resetImports()}
                    setTab={(tab) => this.setTab(tab)}
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

