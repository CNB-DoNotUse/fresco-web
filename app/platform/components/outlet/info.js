import React from 'react';
import utils from 'utils';
import _ from 'lodash';

export default class Info extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            outletAvatar: this.props.outlet.avatar
        }

        this.avatarInputChange = this.avatarInputChange.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        //Change avatar if it changes from the outlet prop
        if(nextProps.outlet.avatar !== this.state.outletAvatar) {
            this.setState({
                outletAvatar: nextProps.outlet.avatar
            });
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
            link: this.refs['outlet-website'].value,
            title: this.refs.name.value
        };

        if(!utils.compareObjects(params, this.props.outlet)) {
            this.updateInfo(avatarFiles, params);
        } else {
            if(avatarFiles.length) {
                this.updateAvatar(avatarFiles);
            } else {
                return $.snackbar({ content: 'Trying making a few changes to your outlet, then try saving!' });
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
        })
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
            url: "/api/refresh/outlet/avatar",
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

        return (
            <div className="card settings-info">
                <div 
                    className="avatar" 
                    ref="outlet-avatar-image" 
                    style={{backgroundImage: 'url(' + this.state.outletAvatar + ')'}} 
                >
                    <div className="overlay" onClick={() => { this.refs.avatarFileInput.click() }}>
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
                        className="outlet-name"
                        ref="name"
                        placeholder="Outlet name"
                        defaultValue={outlet.title}
                    />

                    <input
                        type="text"
                        className="outlet-website"
                        ref="outlet-website"
                        placeholder="Website"
                        defaultValue={outlet.link}
                    />

                    <textarea
                        className="outlet-bio"
                        ref="bio"
                        rows="2"
                        placeholder="Bio"
                        defaultValue={outlet.bio}
                    />

                    <button 
                        className="btn btn-flat card-foot-btn" 
                        onClick={this.updateSettings}>SAVE CHANGES</button>
                </div>
            </div>
        );
    }
}
