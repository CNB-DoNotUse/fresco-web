import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Snackbar from 'material-ui/Snackbar';
import OAuthForm from '../components/oauth/oauth-form';

import * as ui from 'app/redux/actions/ui';
import * as oauth from 'app/redux/actions/oauth'

import 'app/sass/public/oauth/oauth';

/**
 * Public OAuth Page
 */
class OAuth extends React.Component {

    static propTypes = {
        outlet: PropTypes.object.isRequired,
        loggedIn: PropTypes.bool.isRequired,
        hasGranted: PropTypes.bool.isRequired
    };

    render() {
        const { outlet, scope } = this.props;

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
                                your account and the <strong>{outlet.title}</strong> outlet. {scope === 'read' ? 
                                    'It will not be able to modify any settings.' : 
                                    'It will be able to modify your settings.'}
                            </p>
                        </div>
                    </div>

                    <OAuthForm {...this.props} />
                </div>

                <Snackbar
                    message={this.props.ui.snackbarText}
                    open={this.props.ui.showSnackbar}
                    autoHideDuration={20000000}
                    onRequestClose={() => this.props.toggleSnackbar('', false)}
                    bodyStyle={{ lineHeight: '1.5em', padding: '10px 20px' }}
                />
            </div>
        )
    }
}

OAuth.defaultProps = {
    loggedIn: false,
    hasGranted: false
}


const mapStateToProps = (state) => {
    return {
        ui: state.ui,
        outlet: state.outlet,
        loggedIn: state.loggedIn,
        scope: state.scope,
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