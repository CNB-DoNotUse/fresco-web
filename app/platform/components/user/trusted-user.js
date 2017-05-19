import React, { PropTypes } from 'react';
import Card from 'app/platform/components/global/card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Confirm from 'app/platform/components/dialogs/confirm';
import api from 'app/lib/api';

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
        const { detailUser: { id } } = this.props;
        if (!confirm) { //first click
            if (this.mapTrustedStateToSelect(this.props) === this.mapTrustedStateToSelect(this.state)) {
                // no change has been made
                this.context.openAlert({content: "There is nothing to change"});
                return;
            } else {
                this.setState({ confirm: true }, () => { console.log(this.state); })
            }
        } else { //after confirm
            const params = { trusted };
            api.post(`user/${id}/update`, params)
                .then((res) => {
                    // @ttention case for redux
                    location.reload();
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

    render() {
        const { confirm } = this.state;
        return (
            <Card
                saveFunc={ this.onSave }
                headerText="Trust status">
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
