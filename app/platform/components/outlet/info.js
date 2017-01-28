import React from 'react';
import utils from 'utils';

export default class Info extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            outletAvatar: utils.formatImg(this.props.outlet.avatar, 'small'),
            changes: [],
            disabled: true
        }

        this.avatarInputChange = this.avatarInputChange.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        // Change avatar if it changes from the outlet prop
        if (nextProps.outlet.avatar !== this.state.outletAvatar) {
            this.setState({ outletAvatar: utils.formatImg(nextProps.outlet.avatar, 'small') });
        }
    }


    /**
     * Input change event for tracking changes in state
     * @param {String} value Value of the field
     * @param {String} originalValue The original value to compare against
     * @param {String} source Unique source for tracking changes
     */
    onInputChange(value, originalValue, source) {
        const { changes } = this.state
        const changed = value !== originalValue;

        if(changed && !changes.includes(source)) {
            this.setState({
                disabled: false,
                changes: changes.concat(source)
            });
        } else if(!changed) {
            if(changes.length <= 1 && changes.includes(source)) {
                this.setState({
                    disabled: true,
                    changes: []
                });
            } else {
                this.setState({
                    changes: changes.filter(change => change !== source)
                });
            }
        }
    }

	/**
	 * File lisntener for outlet avater
	 */
    avatarInputChange(e) {
        const target = e.target;

        if (target.files && target.files[0]) {
            const reader = new FileReader();

            reader.onload = (data) => {
                this.setState({
                    outletAvatar: data.target.result
                })
            };

            reader.readAsDataURL(target.files[0]);
        }
    }

	/**
	 * Saves outlet's info
	 */
    updateSettings() {
        if(this.loading) return;

        const avatarFiles = this.refs['avatarFileInput'].files;
        const params = {
            bio: this.refs.bio.value,
            link: this.refs.link.value,
            title: this.refs.name.value
        };

        //Check so we don't call outlet/update without needing to, and just go straight to updating the avatar
        if(!utils.compareObjects(params, this.props.outlet)) {
            this.updateInfo(avatarFiles, params);
        } else {
            if(avatarFiles.length) {
                this.updateAvatar(avatarFiles);
            }
        }
    }

    /**
     * Updates the outlet with the params passed
     */
    updateInfo(avatarFiles, params) {
        this.loading = true;
        $.ajax({
            url: "/api/outlet/update",
            method: 'POST',
            beforeSend: (xhr) => {
                xhr.setRequestHeader('TTL', '0');
            },
            data: JSON.stringify(params),
            contentType: 'application/json'
        })
        .done((response) => {
            if(avatarFiles.length) {
                this.updateAvatar(avatarFiles, true);
            } else {
                this.props.updateOutlet(response);
                return $.snackbar({ content: 'Your info has been successfully saved!' });
            }
        })
        .fail((error) => {
            return $.snackbar({ content: utils.resolveError(error, 'There was an error updating your settings!') });
        })
        .always(() => {
            this.loading = false;
        });
    }

    /**
     * Updates the outlet's avatar
     * @param  {BOOL} calledWithInfo Context for the error message
     */
    updateAvatar(avatarFiles, calledWithInfo) {
        let files = new FormData();
        files.append('avatar', avatarFiles[0]);
        this.loading = true;

        $.ajax({
            url: "/api/outlet/avatar",
            method: 'POST',
            data: files,
            contentType: false,
            processData: false,
            beforeSend: (xhr) => {
                xhr.setRequestHeader('TTL', '0');
            }
        })
        .done((response) => {
            return $.snackbar({
                content: `Your ${calledWithInfo ? 'info' : 'avatar'} has been successfully updated!`
            });
        })
        .fail((error) => {
            return $.snackbar({ content: utils.resolveError(error, 'There was an error updating your avatar!') });
        })
        .always(() => {
            this.loading = false;
        });
    }

    render() {
        const { outlet } = this.props;
        const { disabled } = this.state;

        return (
            <div className="card settings-info">
                <div
                    className="avatar"
                    ref="outlet-avatar-image"
                    style={{backgroundImage: 'url(' + this.state.outletAvatar + ')'}}
                >
                    <div className="overlay" onClick={() => this.refs.avatarFileInput.click()}>
                        <span className="mdi mdi-upload"></span>
                    </div>
                </div>

                <div className="card-form">
                    <input
                        type="file"
                        className="outlet-avatar-input"
                        ref="avatarFileInput"
                        accept="image/png,image/jpeg"
                        onChange={this.avatarInputChange}
                        multiple
                    />

                    <input
                        type="text"
                        ref="name"
                        placeholder="Outlet name"
                        onKeyUp={(e) => this.onInputChange(e.target.value,  outlet.title, 'title')}
                        defaultValue={outlet.title}
                    />

                    <input
                        type="text"
                        ref="link"
                        placeholder="Website"
                        onKeyUp={(e) => this.onInputChange(e.target.value,  outlet.link, 'link')}
                        defaultValue={outlet.link}
                    />

                    <textarea
                        ref="bio"
                        rows="2"
                        placeholder="Bio"
                        onKeyUp={(e) => this.onInputChange(e.target.value,  outlet.bio, 'bio')}
                        defaultValue={outlet.bio}
                    />

                    <button
                        className={`btn btn-flat card-foot-btn ${disabled ? 'disabled' : 'changed'}`}
                        onClick={this.updateSettings}>SAVE CHANGES</button>
                </div>
            </div>
        );
    }
}
