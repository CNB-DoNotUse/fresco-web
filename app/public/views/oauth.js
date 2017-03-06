import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

/**
 * Public OAuth Page
 */
class OAuth extends React.Component {

    render() {
        return(
            <div className="oauth"></div>
        )
    }
}

OAuth.propTypes = {
    gallery: PropTypes.object,
    userAgent: PropTypes.string,
};

ReactDOM.render(
    <OAuth/>,
    document.getElementById('app')
);
