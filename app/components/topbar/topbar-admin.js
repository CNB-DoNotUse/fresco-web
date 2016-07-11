import React, { PropTypes } from 'react';
import moment from 'moment';
import global from '../../../lib/global';
import times from 'lodash/times';

/** //
Description : Top for admin page
// **/
class TopBarAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: false };
        this.setTab = this.setTab.bind(this);
        this.clickImportFileUpload = this.clickImportFileUpload.bind(this);
        this.handleTwitterInputKeyDown = this.handleTwitterInputKeyDown.bind(this);
    }

    componentDidMount() {
        $('[data-tab="' + this.props.activeTab + '"]').addClass('toggled');
    }

    componentWillUpdate(nextProps) {
        if (this.props.activeTab !== nextProps.activeTab) {
            $('.tab, .tab-admin').removeClass('toggled');
            $('[data-tab="' + nextProps.activeTab + '"]').addClass('toggled');
        }
    }

    clickImportFileUpload() {
        this.refs.uploadImportFiles.click();
    }

    uploadImages(res) {
        const data = new FormData();
        const posts = res.posts;
        const files = this.refs.uploadImportFiles.files;

        for (let i = files.length - 1; i >= 0; i--) {
            data.append(i, files[i]);
        }

        posts.forEach((p, i) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(files[i]);
            reader.onload = () => {
                $.ajax({
                    type: 'PUT',
                    url: p.urls[0],
                    data: reader.result,
                })
                .done((res, status, xhr) => {
                    this.createPost({
                        key: p.key,
                        uploadId: p.uploadId,
                        eTags: [xhr.getResponseHeader('ETag')],
                    });
                });
            };
        });
    }

    createPost(d) {
        // data = {key, uploadId, eTags[]}
        $.ajax({
            type: 'POST',
            url: 'api/post/complete',
            data: JSON.stringify(d),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done((res, status, xhr) => {
            $.snackbar({ content: 'Successfully imported media' });
        });
    }

    createGallery() {
        const files = this.refs.uploadImportFiles.files;
        const caption = `Gallery imported from local system on
        ${moment().format('MMMM Do YYYY, h:mm:ss a')}`;
        const posts = [];

        times(files.length, (i) => {
            posts.push({ contentType: files[i].type });
        });

        const data = {
            caption,
            tags: ['a'],
            posts,
        };

        $.ajax({
            url: '/api/gallery/import',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done((res) => {
            this.uploadImages(res);
        })
        .fail(() => {
            $.snackbar({ content: 'Failed to import media' });
        });
    }

    onImportFiles() {
        this.createGallery();
    }

    handleTwitterInputKeyDown(e) {
        if (e.keyCode !== 13 || this.state.loading) return;

        this.setState({ loading: true });
        const data = new FormData();
        data.append('tweet', this.refs['twitter-import-input'].value);

        $.ajax({
            url: '/scripts/gallery/import',
            type: 'POST',
            data,
            processData: false,
            contentType: false,
            cache: false,
            dataType: 'json',
            success: (result) => {
                if (result.err) {
                    return $.snackbar({ content: global.resolveError(result.err) });
                }

                $.snackbar({ content: 'Gallery Imported!' });
                this.refs['twitter-import-input'].value = '';
                this.props.setTab('imports');
                return this.props.resetImports();
            },
            error: () => {
                $.snackbar({ content: 'Failed to import media' });
            },
            complete: () => {
                this.setState({ loading: false });
            },
        });
    }

    setTab(e) {
        const tab = e.target.dataset.tab;
        this.props.setTab(tab);
    }

    render() {
        return (
            <nav className="navbar navbar-fixed-top navbar-default">
                <input
                    type="file"
                    ref="uploadImportFiles"
                    style={{ position: 'absolute', top: '-100px' }}
                    accept="image/*,video/*,video/mp4"
                    multiple
                    onChange={() => this.onImportFiles()}
                />

                <div className="dim transparent toggle-drop toggler"></div>

                <button type="button" className="icon-button toggle-drawer toggler hidden-lg">
                    <span className="mdi mdi-menu icon"></span>
                </button>

                <button
                    type="button"
                    className="icon-button hidden-xs upload-import"
                    onClick={this.clickImportFileUpload}
                >
                    <span className="mdi mdi-upload icon"></span>
                </button>

                <div className="form-group-default">
                    <input
                        type="text"
                        className="form-control twitter-import"
                        placeholder="Link"
                        ref="twitter-import-input"
                        onKeyDown={this.handleTwitterInputKeyDown}
                    />
                </div>

                <div className="tab-control admin-tabs">
                    <button
                        className="btn btn-flat tab-admin"
                        data-tab="assignments"
                        onClick={this.setTab}
                    >
						Assignments
                    </button>

                    <button
                        className="btn btn-flat tab-admin"
                        data-tab="submissions"
                        onClick={this.setTab}
                    >
                        Submissions
                    </button>

                    <button
                        className="btn btn-flat tab-admin"
                        data-tab="imports"
                        onClick={this.setTab}
                    >
                        Imports
                    </button>
                </div>

                <li
                    className="drop no-border pull-right hidden-xs"
                    style={{ display: 'none' }}
                >
                    <button className="toggle-drop md-type-subhead">
                        <span className="mdi mdi-settings icon" />
                        <span className="mdi mdi-menu-down icon" />
                    </button>

                    <div className="drop-menu panel panel-default">
                        <div className="toggle-drop toggler md-type-subhead">
                            Settings
                            <span className="mdi mdi-menu-up icon pull-right" />
                        </div>

                        <div className="drop-body">
                            <ul className="md-type-subhead">
                                <li>Import alternate</li>
                                <li>Import alternate</li>
                            </ul>
                        </div>
                    </div>
                </li>
            </nav>
		);
    }
}

TopBarAdmin.propTypes = {
    activeTab: PropTypes.string.isRequired,
    setTab: PropTypes.func.isRequired,
    resetImports: PropTypes.func.isRequired,
};

export default TopBarAdmin;

