import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import Base from './base';
import Confirm from './confirm';
import VersionDropdown from '../outlet/version-dropdown';
import 'app/sass/platform/dialogs/clientForm.scss';

const deleteMessage = 'Are you sure you want to delete this client?';
const rekeyMessage = 'Are you sure you want to create new client credentials? This will invalidate all of your current integrations.';

/**
 * Form for creating/updating a client.
 * Found in outlet settings in the clients component
 */
export default class ClientForm extends React.Component {
    static propTypes = {
        toggle: PropTypes.func,
        toggled: PropTypes.bool,
        body: PropTypes.string,
        newClient: PropTypes.bool,
        updateClient: PropTypes.func,
        generateClient: PropTypes.func,
        client: PropTypes.object
    }

    static defaultProps = {
        toggle: () => {},
        toggled: false,
        newClient: true,
        selectedVersion: null
    }

    state = {
        shouldRekey: false,
        redirect_uri: '',
        tag: '',
        confirmMessage: deleteMessage,
        confirmButton: 'Delete',
        confirmFormToggled: false
    }

    componentDidMount() {
        //Do API version loading
        this.props.getVersions();

        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    /**
     * Handles click event from dom listener. Determines if click is outside of the modal
     */
    handleClickOutside = () => {
        const domNode = ReactDOM.findDOMNode(this.refs.modal);

        if ((!domNode || !domNode.contains(event.target)) && this.props.toggled) {
            this.props.toggle(false);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        //Incoming new client, or client state change
        if((nextProps.client && !this.props.client) || (nextProps.client && (nextProps.client.id !== this.props.client.id))) {
            this.setState({
                tag: nextProps.client.tag || '',
                redirect_uri: nextProps.client.redirect_uri || '',
                selectedVersion: nextProps.client.api_version
            });
        } else if(nextProps.newClient && this.props.client !== null) { //New token, and no client currently
            this.setState({
                tag: '',
                redirect_uri: '',
                shouldRekey: false,
                selectedVersion: null
            })
        }
    }

    /**
     * Form confirmation
     */
    onSave = () => {
        const { client, outlet } = this.props;

        const params = {
            tag: this.state.tag,
            redirect_uri: this.state.redirect_uri,
            enabled: true,
            api_version_id: this.state.selectedVersion ? this.state.selectedVersion.id : null
        }

        //Client is passed
        if(this.props.client) {
            params.rekey = this.state.shouldRekey

            if(params.rekey) {
                return this.setState({
                    confirmFormToggled: true,
                    confirmMessage: rekeyMessage,
                    confirmButton: 'Save',
                    onConfirm: () => { this.props.updateClient(client.id, params) }
                })
            }

            this.props.updateClient(client.id, params);
        } else if (this.props.newClient) {
            params.scope = 'public';
            params.outlet_id = outlet.id;
            this.props.generateClient(params);
        }
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
     * When a version is selected
     */
    versionSelected = (selectedVersion) => {
        this.setState({ selectedVersion })
    }

    /**
     * Returns true if inputs are valid
     */
    validInputs = () => {
        if(!utils.isEmptyString(this.state.tag) && !utils.isEmptyString(this.state.redirect_uri)) {
           return true;
        }

        return false;
    }

    /**
     * Calls delete function
     */
    delete = () => {
        this.setState({
            confirmFormToggled: true,
            confirmMessage: deleteMessage,
            confirmButton: 'Delete',
            onConfirm: () => { this.props.deleteClient(this.props.client.id) }
        })
    }

    /**
     * Delete action called
     */
    onConfirm = () => {
        this.setState({ confirmFormToggled: false });
        this.state.onConfirm();
    }


    render() {
        const { toggled, onCancel, body, toggle, newClient, client, versions } = this.props;
        const { rekeyDialogToggled, selectedVersion } = this.state;
        const disabled = !this.validInputs();

        return (
            <Base toggled={toggled} toggle={toggle}>
                <div ref="modal" className={`dialog-modal--tokenForm ${toggled ? 'toggled' : ''}`}>
                    <form className="dialog-modal__form" onSubmit={this.onConfirm}>
                        <div className="dialog-modal__headerActions">
                            <VersionDropdown
                                selectedVersion={selectedVersion}
                                versionSelected={this.versionSelected}
                                versions={versions}
                             />

                            {!newClient &&
                                <i
                                className="mdi mdi-delete dialog-modal__delete"
                                onClick={this.delete} />
                            }
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
                        {!newClient &&
                            <button
                                className={`primary btn  dialog-modal__rekey ${this.state.shouldRekey ? '' : 'disabled'}`}
                                onClick={() => this.setState({ shouldRekey: !this.state.shouldRekey })}
                            >
                                Regenerate Credentials
                            </button>
                        }

                        <button
                            className={`primary btn ${disabled ? 'disabled' : ''}`}
                            onClick={this.onSave}
                            disabled={disabled}
                        >
                            {newClient ? 'Create' : 'Save'}
                        </button>


                        <button
                            className="cancel btn"
                            onClick={() => toggle()}
                        >
                            Cancel
                        </button>
                    </div>

                    {!newClient &&
                        <Confirm
                            onConfirm={this.onConfirm}
                            onCancel={() => { this.setState({ confirmFormToggled: false }) }}
                            toggled={this.state.confirmFormToggled}
                            header={this.state.confirmMessage}
                            zIndex={6}
                            confirmButton={this.state.confirmButton}
                        />}
                </div>
            </Base>
        );
    }
}
