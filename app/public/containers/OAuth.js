import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ui from 'app/redux/actions/ui';
import * as oauth from 'app/redux/actions/oauth'

import 'app/sass/public/oauth/oauth';

/**
 * Public OAuth Page
 */
class OAuth extends React.Component {

    propTypes = {
        outlet: PropTypes.object.isRequired,
        loggedIn: PropTypes.bool.isRequired,
        hasGranted: PropTypes.bool.isRequired
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.ui.showSnackbar) {
            $.snackbar({ content: nextProps.ui.snackbarText });
            this.props.toggleSnackbar('', false);
        }
    }

    render() {
        const { outlet } = this.props;

        return(
            <div className="oauth">
                <a href="/">
                    <span className="icon-fresco oauth__form-logo"></span>
                </a>

                <div className="oauth__inner">
                    <div className="oauth__header">
                        <h3 className="oauth__form__header">An application would like to connect to  your account:</h3>

                        <div className="oauth__application bold">
                            <img src={outlet.avatar} />
                            <p className="oauth__application__title">{outlet.title}</p>
                            <a href={outlet.link} className="oauth__application__site" >{outlet.link}</a>
                        </div>

                        <div className="oauth__disclaimer">
                            <p>
                                <strong>{outlet.title}</strong> will be able to access 
                                your account and the <strong>{outlet.title}</strong> outlet. It will not be able to modify any settings.
                            </p>
                        </div>
                    </div>

                    <OAuthForm {...this.props} />
                </div>
            </div>
        )
    }
}

OAuth.defaultProps = {
    loggedIn: false,
    hasGranted: false
}


class OAuthForm extends React.Component {

    state = {
        username: '',
        password: '',
    }

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
    login = () =>  {
        this.props.authorize({
            username: this.state.username,
            password: this.state.password,
        });
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
                        onClick={this.props.revoke}>Revoke</span>
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
            const disabled = !this.validInputs();
            const buttonClass = disabled ? 'oauth__form__action--disabled' : 'oauth__form__action--grant';

            body = (
                <form className="oauth__form__body">
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
                </form>
            );

            actions = (
                <div className="oauth__form__actions">
                    <span 
                        className="oauth__form__action oauth__form__action--cancel" 
                        onClick={this.props.cancel}>Cancel</span>
                    <span 
                        className={`oauth__form__action ${buttonClass}`} 
                        onClick={this.props.login}>Log In & Allow</span>
                </div>
            );
        }

        return (
            <div className="oauth__form">
                {body}
                {actions}
            </div>
        )
    }

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

const mapStateToProps = (state) => {
    return {
        ui: state.ui,
        outlet: state.outlet,
        loggedIn: state.loggedIn,
        hasGranted: state.hasGranted
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        { ...ui, ...oauth },
        dispatch
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(OAuth);