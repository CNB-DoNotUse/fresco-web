import React from 'react';
import Sidebar from '../components/global/sidebar';
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
export default class App extends React.Component {

    componentDidMount() {
        $.material.init();
    }

    render() {
        return (
            <div>
                <div className="container-fluid">
                    <Sidebar
                        query={this.props.query}
                        user={this.props.user}
                    />

                    <div className="col-md-12 col-lg-10">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
