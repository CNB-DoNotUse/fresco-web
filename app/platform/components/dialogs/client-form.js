import React, { PropTypes } from 'react';
import utils from 'utils';
import Base from './base';
import Confirm from './confirm';
import Dropdown from '../global/dropdown';
import 'app/sass/platform/dialogs/tokenForm.scss';

/**
 * Form for creating/updating a client. 
 * Found in outlet settings in the clients component
 */
export default class ClientForm extends React.Component {
    static propTypes = {
        toggle: PropTypes.func,
        toggled: PropTypes.bool,
        body: PropTypes.string,
        newToken: PropTypes.bool,
        updateToken: PropTypes.func,
        createToken: PropTypes.func,
        client: PropTypes.object
    }

    static defaultProps = {
        toggle: () => {},
        toggled: false,
        newToken: true
    }

    state = {
        api_versions: [],
        disabled: false,
        shouldRekey: false,
        redirect_uri: '',
        tag: ''
    }

    componentDidMount() {
        //Do API version loading
        this.props.getVersions();
    }

    componentWillUpdate(nextProps, nextState) {
        if((nextProps.client && !this.props.client) || (nextProps.client && (nextProps.client.id !== this.props.client.id))) {
            this.setState({ 
                tag: nextProps.client.tag || '', 
                redirect_uri: nextProps.client.redirect_uri || ''
            });
        } else if(nextProps.newToken && this.props.client !== null) {
            this.setState({
                tag: '',
                redirect_uri: ''
            })
        }
    }

    /**
     * Form confirmation
     * @return {[type]} [description]
     */
    onConfirm = () => {
        const { client } = this.props;

        const params = {
            tag: this.state.tag,
            redirect_uri: this.state.redirect_uri,
            enabled: true,
            api_version_id: '7ewm8YP3GL5x'
        }

        //Client is passed
        if(this.props.client) {
            params.rekey = this.state.shouldRekey
            this.props.updateClient(client.id, params);
        } else if (this.props.newToken) {
            params.scope = 'public';
            this.props.generateClient(params);
        }
    }

    /**
     * Toggles the `shouldRekey` state
     */
    toggleRekey = () => {
        this.setState({ shouldRekey: !this.state.shouldRekey })
    }

    handleInputChange = (e) => {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    /**
     * Returns if inputs should be disabled or note
     */
    disabled = () => {
        if(utils.isEmptyString(this.state.tag) || !utils.isValidUrl(this.state.redirect)) {
           return true;
        } else {
            return false;
        }
    }

    render() {
        const { toggled, onCancel, body, toggle, newToken, client } = this.props;
        const { disabled, rekeyDialogToggled } = this.state;

        return (
            <Base toggled={toggled}>
                <div className={`dialog-modal--tokenForm ${toggled ? 'toggled' : ''}`}>
                    <form className="dialog-modal__form" onSubmit={this.onConfirm}>
                        <div className="dialog-modal__headerActions">
                            <Dropdown
                                title="API Version"
                                dropdownClass="dialog-modal__token-dropdown"
                                options={this.props.api_versions} />

                            <i 
                                className="mdi mdi-delete dialog-modal__delete"
                                onClick={() => toggle()} />
                        </div>
                        
                        <input
                            name="tag"
                            type="text"
                            className="dialog-modal__headerInput"
                            placeholder="Client name"
                            value={this.state.tag}
                            onChange={(e) => this.handleInputChange(e)}
                        />

                        <input
                            name="redirect_uri"
                            type="text"
                            className="dialog-modal__redirectInput"
                            placeholder="Redirect URI"
                            value={this.state.redirect_uri}
                            onChange={(e) => this.handleInputChange(e)}
                        />
                    </form>

                    <div className="dialog-modal__footer">
                        {!newToken &&
                            <button
                                className={`primary btn  dialog-modal__rekey ${this.state.shouldRekey ? '' : 'disabled'}`}
                                onClick={this.toggleRekey}
                            >
                                Regenerate Token
                            </button>
                        }

                        <button
                            className="primary btn"
                            onClick={this.onConfirm}
                            disabled={disabled}
                        >
                            {newToken ? 'Create' : 'Save'}
                        </button>


                        <button
                            className="cancel btn"
                            onClick={() => toggle()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Base>
        );
    }
}