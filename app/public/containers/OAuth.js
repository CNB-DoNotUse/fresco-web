import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ui from 'app/redux/actions/ui';

import 'app/sass/public/oauth/oauth';

/**
 * Public OAuth Page
 */
class OAuth extends React.Component {
    render() {
        const { outlet } = this.props;

        return(
            <div className="oauth">
                <span className="icon-fresco oauth__form-logo"></span>

                <div className="oauth__inner">
                    <div className="oauth__header">
                        <h3 className="oauth__form__header">An application would like to connect to  your account:</h3>

                        <div className="oauth__application">
                            <img src="https://cdn.fresconews.com/images/350/5de2af34cb8cfaeb3a5c4ebe7695176c_1480905454108_avatar.jpg" />
                            <p className="oauth__application__title">{outlet.title}</p>
                            <a href={outlet.link} className="oauth__application__site" >http://fresconews.com</a>
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
    hasGranted: false,
    outlet: {title: 'Fresco News', link: 'http://fresconews.com'}
}

OAuth.propTypes = {
    application: PropTypes.object.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    hasGranted: PropTypes.bool.isRequired
};

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

    login() {
        this.props.authorize();
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
                <div className="oauth__form__body">
                    <p className="">{outlet.title} is already connected to your account.</p>
                </div>
            );

            actions = (
                <div className="oauth__form__actions">
                    <span 
                        className="oauth__form__action oauth__form__action--revoke" 
                        onClick={this.props.revoke}>Revoke</span>
                    <span 
                        className="oauth__form__action oauth__form__action--grant" 
                        onClick={this.props.allow}>Allow</span>
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
                        onClick={this.props.allow}>Allow</span>
                </div>
            );
        } else if(!loggedIn) {
            const disabled = !this.validInputs();
            const buttonClass = disabled ? 'oauth__form__action--disabled' : 'oauth__form__action--grant';

            body = (
                <div className="oauth__form__body">
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
                </div>
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
            <div className="oauth__form_-wrap">
                {this.renderForm()}
            </div>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        ui: state.ui
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        { ...ui },
        dispatch
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(OAuth);