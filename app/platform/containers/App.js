import { connect } from 'react-redux';
import { Map } from 'immutable';
import App from '../views/app';

// Return react-redux connected container from App view

function mapStateToProps(state) {
    return {
        user: state.get('user', Map()).toJS(),
    };
}

export default connect(mapStateToProps)(App);

