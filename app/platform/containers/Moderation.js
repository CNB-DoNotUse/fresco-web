import React, { PropTypes } from 'react';
import 'app/sass/platform/_moderation.scss';
import * as moderationActions from 'app/redux/modules/moderation';
import { connect } from 'react-redux';
import TopBar from '../components/topbar';

class Moderation extends React.Component {
    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        onSetActiveTab: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        alert: PropTypes.string,
    };

    componentDidMount() {
        $.material.init();
    }

    componentDidUpdate(prevProps) {
        if (this.props.activeTab !== prevProps.activeTab) {
            $.material.init();
        }
    }

    render() {
        const {
            onSetActiveTab,
            activeTab,
        } = this.props;

        return (
            <div className="container-fluid">
                <TopBar
                    title="Moderation"
                    tabs={['GALLERIES', 'USERS']}
                    setActiveTab={onSetActiveTab}
                    activeTab={activeTab}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeTab: state.getIn(['moderation', 'activeTab']),
        loading: state.getIn(['moderation', 'loading']),
        alert: state.getIn(['moderation', 'alert']),
        tabs: state.getIn(['moderation', 'tabs']),
    };
}

export default connect(mapStateToProps, {
    onSetActiveTab: moderationActions.setActiveTab,
})(Moderation);

