import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Sidebar from '../components/sidebar';
import { Map } from 'immutable';
global.jQuery = require('jquery');
import '../../sass/platform/screen.scss';
require('snackbarjs');
require('alerts');
require('script!bootstrap/dist/js/bootstrap');
require('script!bootstrap-material-design/dist/js/material');
require('script!bootstrap-material-design/dist/js/ripples');
require('script!alertify.js/dist/js/alertify');

/**
 * Root App Wrapper
 */
class App extends React.Component {

    componentDidMount() {
        $.material.init();
    }

    render() {
        return (
            <div>
                <div className="container-fluid">
                    <Sidebar user={this.props.user} />

                    <div className="col-md-12 col-lg-10">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

App.propTypes = {
    user: PropTypes.object,
    children: PropTypes.node,
};

function mapStateToProps(state) {
    return {
        user: state.get('user', Map()).toJS(),
    };
}

export default connect(mapStateToProps)(App);

