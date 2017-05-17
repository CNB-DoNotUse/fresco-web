import React from 'react';
import Card from 'app/platform/components/global/card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class TrustedUser extends React.Component {

    constructor(props) {
        super(props);
        const { detailUser: { trusted, rating } } = this.props;
        this.state = {
            trusted,
            rating,
        }
    }

    handleChange = (e, index, val) => {
        debugger
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
        this.setState({ trusted }, () => { console.log(this.state);});
        return;
    }

    mapStateToSelect = () => {
        if (this.state.trusted) {
            return "trusted";
        } else if (!this.state.trusted && typeof (this.state.trusted) === "object") {
            return "automatic";
        } else {
            return "untrusted";
        }
    }

    onSave() {
        // package information
        // send to api user/:id/updated
        // display snackbar confirmation
    }

    render() {
        return (
            <Card
                saveFunc={() => {}}
                headerText="Trust status">
                <div id="trusted-select">
                    <SelectField value={ this.mapStateToSelect() }
                        onChange={this.handleChange}>
                        {
                            [ <MenuItem value="trusted" key={0} primaryText="Trusted" />,
                            <MenuItem value="untrusted" key={1} primaryText="Untrusted" />,
                            <MenuItem value="automatic" key={2} primaryText="Automatic" /> ]
                        }

                    </SelectField>
                    <p>Users automatically become trusted when their rating reaches 85%, unless defined otherwise.</p>
                </div>
            </Card>
        );
    }
}

export default TrustedUser;
