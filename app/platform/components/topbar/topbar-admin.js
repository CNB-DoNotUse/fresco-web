import React, { PropTypes } from 'react';
import moment from 'moment';
import times from 'lodash/times';
import request from 'superagent';

/**
 * Description : Top for admin page
 */
class TopBarAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: false };
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

    onImportFiles() {
        this.createGallery();
    }

    uploadImages(res) {
        const posts = res.posts;
        const files = this.refs.uploadImportFiles.files;

        posts.forEach((p, i) => {
            request
                .put(p.upload_url)
                .set('Content-Type', files[i].type)
                .send(files[i])
                .end((err) => {
                    if (!err) $.snackbar('Gallery imported!');
                });
        });
    }

    createGallery() {
        const files = this.refs.uploadImportFiles.files;
        const caption = `Gallery imported from local system on ${moment().format('MMMM Do YYYY, h:mm:ss a')}`;
        const posts = [];

        times(files.length, (i) => {
            posts.push({ contentType: files[i].type });
        });

        const data = {
            caption,
            tags: [],
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

    handleTwitterInputKeyDown(e) {
        const tweet = this.refs['twitter-import-input'].value;
        const twitterId = tweet.split('/').pop();
        if (e.keyCode !== 13 || this.state.loading || !tweet.length) return;
        this.setState({ loading: true });

        $.ajax({
            url: 'api/gallery/import',
            type: 'POST',
            data: JSON.stringify({
                external_id: twitterId,
                external_source: 'twitter',
            }),
            contentType: 'application/json',
            dataType: 'json',
            success: () => {
                $.snackbar({ content: 'Gallery Imported!' });
                this.refs['twitter-import-input'].value = '';
                this.props.setTab('imports');
                this.props.resetImports();
            },
            error: () => {
                $.snackbar({ content: 'Failed to import media' });
            },
            complete: () => {
                this.setState({ loading: false });
            },
        });
    }

    clickImportFileUpload() {
        this.refs.uploadImportFiles.click();
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
                    onClick={() => this.clickImportFileUpload()}
                >
                    <span className="mdi mdi-upload icon"></span>
                </button>

                <div className="form-group-default">
                    <input
                        type="text"
                        className="form-control twitter-import floating-label"
                        placeholder="Link"
                        ref="twitter-import-input"
                        onKeyDown={(e) => this.handleTwitterInputKeyDown(e)}
                    />
                </div>

                <div className="tab-control">
                    <button
                        className="btn btn-flat tab-admin"
                        data-tab="assignments"
                        onClick={() => this.props.setTab('assignments')}
                    >
						Assignments
                    </button>

                    <button
                        className="btn btn-flat tab-admin"
                        data-tab="submissions"
                        onClick={() => this.props.setTab('submissions')}
                    >
                        Submissions
                    </button>

                    <button
                        className="btn btn-flat tab-admin"
                        data-tab="imports"
                        onClick={() => this.props.setTab('imports')}
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

