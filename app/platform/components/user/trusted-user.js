import React, { PropTypes } from 'react';
import Card from 'app/platform/components/global/card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Confirm from 'app/platform/components/dialogs/confirm';
import api from 'app/lib/api';
import { mergeReferral } from 'app/lib/referral';

class TrustedUser extends React.Component {

    constructor(props) {
        super(props);
        const { detailUser: { trusted, rating } } = this.props;
        this.state = {
            trusted,
            rating,
            confirm: false,
        }
    }

    handleChange = (e, index, val) => {
        let trusted;
        switch (val) {
            case "trusted":
                trusted = true;
                break;
            case "untrusted":
                trusted = false;
                break;
            case "automatic":
                trusted = null;
                break;
        }
        this.setState({ trusted }
        );
        return;
    }

    mapTrustedStateToSelect = (objWithTrustedState) => {
        let state;
        if (objWithTrustedState.hasOwnProperty("detailUser")) {
            state = objWithTrustedState.detailUser.trusted;
        } else {
            state = objWithTrustedState.trusted;
        }
        if (state) {
            return "trusted";
        } else if (!state && typeof (state) === "object") {
            return "automatic";
        } else {
            return "untrusted";
        }
    }

    onSave = () => {
        const { confirm, trusted } = this.state;
        const { detailUser } = this.props;
        if (!confirm) { //first click
            if (this.mapTrustedStateToSelect(this.props) === this.mapTrustedStateToSelect(this.state)) {
                // no change has been made
                this.context.openAlert({content: "There is nothing to change"});
                return;
            } else {
                this.setState({ confirm: true })
            }
        } else { //after confirm
            const params = { trusted };
            const { user } = this.props;
            api.post(`user/${detailUser.id}/update`, params)
                .then((res) => {
                    // @ttention case for redux
                    window.__initialProps__.detailUser = res;
                    // console.log(res);
                    location.reload();

                    if(analytics) {
                        analytics.track("User trusted status change", mergeReferral({
                            user_id: detailUser.id,
                            admin: user.id,
                            rating: detailUser.rating,
                            previous_status: this.mapTrustedStateToSelect(this.props),
                            new_status: this.mapTrustedStateToSelect(this.state),
                            time: new Date().toString()
                        }))
                    }
                })
                .catch((err) => {
                    this.context.openAlert({ content: err.msg });
                    this.setState({ confirm: false });
                })
        }
    }

    onCancel = () => {
        const { detailUser: { trusted } } = this.props;
        this.setState({ confirm: false, trusted });
    }


    confirmMessage = () => {
        const { detailUser } = this.props;
        return `Are you sure you want to change ${detailUser.full_name}'s status to ${this.mapTrustedStateToSelect(this.state)}?`;
    }

    convertRating(rating = 0) {
        return `${Math.floor(rating * 100)}%`;
    }

    ratingColor(rating = 0) {
        if (Math.floor(rating * 100) < 85) {
            return 'red';
        } else {
            return 'green';
        }
    }

    render() {
        const { confirm } = this.state;
        const { detailUser } = this.props;
        return (
            <Card
                saveFunc={ this.onSave }
                headerText="Trust status"
                rating={ this.convertRating(detailUser.rating) }
                ratingColor={ this.ratingColor(detailUser.rating) }>
                <div id="trusted-select">
                    <SelectField value={ this.mapTrustedStateToSelect(this.state) }
                        onChange={this.handleChange}>
                        {
                            [ <MenuItem value="trusted" key={0} primaryText="Trusted" />,
                            <MenuItem value="untrusted" key={1} primaryText="Untrusted" />,
                            <MenuItem value="automatic" key={2} primaryText="Automatic" /> ]
                        }
                    </SelectField>
                    <p>Users automatically become trusted when their rating reaches 85%, unless defined otherwise.</p>
                </div>
                { confirm &&
                    <Confirm
                        toggled={ confirm }
                        body={ this.confirmMessage() }
                        header="Change trusted status"
                        confirmText="Save"
                        onCancel={ this.onCancel }
                        onConfirm={ this.onSave }/>
                }
            </Card>
        );
    }
}

TrustedUser.contextTypes = {
    openAlert: PropTypes.func,
    closeAlert: PropTypes.func
};


export default TrustedUser;
