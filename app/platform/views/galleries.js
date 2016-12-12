import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import App from './app';
import GalleryList from './../components/global/gallery-list';
import TopBar from './../components/topbar';


/**
 * Galleries Parent Cmp (composed of GalleryList and Navbar)
 */
class Galleries extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    };

    state = {
        verifiedToggle: getFromSessionStorage('topbar', 'verifiedToggle', true),
    };

    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
    }

    render() {
        const { verifiedToggle } = this.state;
        const { user } = this.props;

        return (
            <App 
                user={this.props.user}
                page='galleries'>
                <TopBar
                    title="Galleries"
                    permissions={user.permissions}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    timeToggle
                    verifiedToggle
                />

                <GalleryList
                    withList={false}
                    highlighted={false}
                    onlyVerified={verifiedToggle}
                />
            </App>
        );
    }

}

ReactDOM.render(
    <Galleries user={window.__initialProps__.user} />,
    document.getElementById('app')
);

