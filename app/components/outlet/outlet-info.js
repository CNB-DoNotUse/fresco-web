import React from 'react'

export default class OutletInfo extends React.Component {

	constructor(props) {
		super(props);

		this.clickProfileImgInput = this.clickProfileImgInput.bind(this);
		this.avatarInputChange = this.avatarInputChange.bind(this);
		this.save = this.save.bind(this);
	}

	clickProfileImgInput() {
		this.refs['outlet-avatar'].click();
	}

	avatarInputChange(e) {
		var target = e.target;
		if(target.files && target.files[0]) {
	        var reader = new FileReader();

	        reader.onload = (data) => {
	            this.refs['avatar-image'].style.backgroundImage = 'url(\'' + data.target.result + '\')';
	        }

	        reader.readAsDataURL(target.files[0]);
		}
	}

	save() {
		var avatarFiles = this.refs['outlet-avatar'].files,
			params = new FormData();
			
		if (avatarFiles && avatarFiles.length > 0) params.append('avatar', avatarFiles[0]);
		params.append('bio', this.refs['outlet-bio'].value);
		params.append('link', this.refs['outlet-website'].value);
		params.append('title', this.refs['outlet-name'].value);

		$.ajax({
			url: "/scripts/outlet/update",
			type: 'POST',
			data: params,
			dataType: 'json',
			cache:false,
			contentType:false,
			processData:false,
			success: (result, status, xhr) => {
				if (result.err)
					return this.error(null, null, result.err);

				//window.location.assign('/outlet');
				window.location.reload();
			},
			error: (xhr, status, error) => {
				$.snackbar({content:resolveError(error)});
			},
			complete: ()  => {
			}
		});
	}

	render() {

		var outlet = this.props.outlet;
		return (
			<div className="card panel card-outlet-info">
				<input type="file" className="outlet-avatar" ref="outlet-avatar" style={{position:'absolute', top: '-100px'}} accept="image/png,image/jpeg" onChange={this.avatarInputChange} multiple />
				<div className="card-image">
					<div className="img" style={{backgroundImage: 'url(' + outlet.avatar + ')'}} id="avatarImage" ref="avatar-image"></div>
					<div className="img-overlay" onClick={this.clickProfileImgInput}>
						<span className="mdi mdi-upload"></span>
					</div>
				</div>
				<div className="card-controls">
					<input type="text" className="outlet-name" ref="outlet-name" placeholder="Outlet name" defaultValue={outlet.title} />
					<input type="text" className="outlet-website" ref="outlet-website" placeholder="Website" defaultValue={outlet.link} />
					<textarea className="outlet-bio" ref="outlet-bio" rows="2" placeholder="Bio" defaultValue={outlet.bio}></textarea>
					<button className="btn btn-flat outlet-info-save" onClick={this.save}>SAVE CHANGES</button>
				</div>
			</div>
		);
	}
}