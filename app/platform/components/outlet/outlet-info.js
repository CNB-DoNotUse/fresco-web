import React from 'react';
import utils from 'utils';

export default class OutletInfo extends React.Component {
    constructor(props) {
        super(props);

        this.clickProfileImgInput = this.clickProfileImgInput.bind(this);
        this.avatarInputChange = this.avatarInputChange.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
    }

	/**
	 * Click event for avater
	 */
    clickProfileImgInput() {
        this.refs['avatarFileInput'].click();
    }

	/**
	 * File lisntener for outlet avater
	 */
    avatarInputChange(e) {
        const target = e.target;

        if (target.files && target.files[0]) {
            const reader = new FileReader();

            reader.onload = (data) => {
                this.refs['outlet-avatar-image'].style.backgroundImage = 'url(\'' + data.target.result + '\')';
            };

            reader.readAsDataURL(target.files[0]);
        }
    }

	/**
	 * Saves outlet's info
	 */
    updateSettings() {
        const avatarFiles = this.refs['avatarFileInput'].files;
        const params = new FormData();
        const self = this;

        // Check if there are files
        if (avatarFiles && avatarFiles.length > 0) params.append('avatar', avatarFiles[0]);

        params.append('bio', this.refs['bio'].value);
        params.append('link', this.refs['outlet-website'].value);
        params.append('title', this.refs['name'].value);

        $.ajax({
            url: "/scripts/outlet/update",
            type: 'POST',
            data: params,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            success(response, status, xhr){
                if (response.err) {
                    return this.error(null, null, response.err);
                }
                self.props.updateOutlet(response.data);
                $.snackbar({ content: 'Your info has been successfully saved!' });
            },
            error: (xhr, status, error) => {
                $.snackbar({ content: utils.resolveError(error, 'There was an error updating your settings!') });
            },
        });
    }

    render() {
        const outlet = this.props.outlet;

        return (
            <div className="card settings-info">
                <div className="avatar" ref="outlet-avatar-image" style={{backgroundImage: 'url(' + outlet.avatar + ')'}} >
                    <div className="overlay" onClick={this.clickProfileImgInput}>
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

                    <button className="btn btn-flat card-foot-btn" onClick={this.updateSettings}>SAVE CHANGES</button>
                </div>
            </div>
        );
    }
}
