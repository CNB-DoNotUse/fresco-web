import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';

class OAuthForm extends React.Component {

    state = {
        username: '',
        password: '',
    };

    handleInputChange = (e) => {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    //Returns true if inputs are valid
    validInputs = () => {
        if(!utils.isEmptyString(this.state.username) && !utils.isEmptyString(this.state.password)) {
           return true;
        }

        return false;
    }

    /**
     * Calls authorize method with login parameters
     */
    login = (e) =>  {
        e.preventDefault();

        this.props.authorize({
            username: this.state.username,
            password: this.state.password,
        }, 'login');
    }

    /**
     * Generates form based on whether or not the user has already
     * granted permission to the app, and/or if they're logged in currently to the stie
     * @return {JSX} JSX of the form
     */
    renderForm = () => {
        const {
            loggedIn,
            hasGranted,
            outlet
        } = this.props;

        let body = '';
        let actions = '';

        if(hasGranted && loggedIn) {
            body = (
                <div className="oauth__form__disclaimer">
                    <p className="bold">{outlet.title} is already connected to your account.</p>
                </div>
            );

            actions = (
                <div className="oauth__form__actions">
                    <span
                        className="oauth__form__action oauth__form__action--revoke"
                        onClick={() => this.props.revoke()}>Revoke</span>
                    <span
                        className="oauth__form__action oauth__form__action--grant"
                        onClick={() => this.props.authorize()}>Allow</span>
                </div>
            );
        } else if(!hasGranted && loggedIn) {
            body = (
                <div className="oauth__form__actions">
                    <span
                        className="oauth__form__action oauth__form__action--cancel"
                        onClick={this.props.cancel}>Cancel</span>
                    <span
                        className="oauth__form__action oauth__form__action--grant"
                        onClick={() => this.props.authorize()}>Allow</span>
                </div>
            );
        } else if(!loggedIn) {
            const buttonClass = !this.validInputs() ? 'oauth__form__action--disabled' : 'oauth__form__action--grant';

            body = (
                <form className="oauth__form__body" onSubmit={this.login}>
                    <input
                        type="text"
                        placeholder="Email or @username"
                        name="username"
                        onChange={(e) => this.handleInputChange(e)} />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        onChange={(e) => this.handleInputChange(e)} />

                    <div className="oauth__form__actions">
                        <span
                            className="oauth__form__action oauth__form__action--cancel"
                            onClick={this.props.cancel}>Cancel</span>
                        <input
                            className={`oauth__form__action ${buttonClass}`}
                            type="submit"
                            value="Log In & Allow" />
                    </div>
                </form>
            );
        }

        return (
            <div className="oauth__form">
                {body}
                {actions}
            </div>
        )
    };

    render() {
        const {
            loggedIn,
            hasGranted,
            outlet
        } = this.props;

        return (
            <div className="oauth__form__wrap">
                {this.renderForm()}
            </div>
        )
    }

}

export default OAuthForm;
