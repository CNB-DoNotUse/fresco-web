import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';

import get from 'lodash/get';
import EditPosts from './edit-posts';
import AutocompleteMap from '../global/autocomplete-map';
import { LoaderOpacity } from '../global/loader';
import { RestrictByOutlet } from 'app/platform/components/pushNotifs/restrict-by.js';
import TitleBody from 'app/platform/components/pushNotifs/title-body.js';
import Confirm from 'app/platform/components/dialogs/confirm.js';
import { recommendGallery } from 'app/lib/models.js';

/**
 * Gallery Recommendation Object
 * Component for recommending galleries to outlets
 */
class Recommend extends React.Component {

    state = this.getStateFromProps(this.props);

    componentDidMount() {
        $.material.init();
    }

    /**
     * getStateFromProps
     *
     * @param {object} props
     * @returns {object} initial state from passed props
     */
    getStateFromProps(props) {
        const { gallery, user } = props;
        if (!gallery) return {};

        return {
            gallery_id: gallery.id,
            tags: gallery.tags || [],
            stories: gallery.stories,
            assignments: gallery.assignments,
            caption: gallery.caption || 'No Caption',
            posts: gallery.posts,
            articles: gallery.articles,
            rating: gallery.rating,
            loading: false,
            ...this.getInitialLocationData(),
            sendToAll: false,
            title: '',
            body: '',
            confirm: false,
            outlets: []
        };
    }

    /**
    * Method to alter state, used for changes in input fields
    */
    onChange(nextState) {
        this.setState(nextState);
    }

    /**
    * onScroll - stopPropagation of event
    * (prevents post/list and other parent cmp scroll listeners from triggering)
    *
    * @param {object} e event
    */
    onScroll = (e) => {
        e.stopPropagation();
    };

    getInitialLocationData() {
        const { gallery } = this.props;
        const location = gallery.location || get(gallery, 'posts[0].location');
        const address = gallery.address || get(gallery, 'posts[0].address');

        return { location, address };
    }

    /**
    * onRecommend handles both send to outlets and send preview
    * it first checks if there are any required fields missing and
    * alerts if there is. If all fields are filled, it sends the preview
    * right away, or transitions to a confirmation modal for actual send
    *
    * @param {Bool} toSelf distinguishes between send preview and send to outlets
    */
    onRecommend = (toSelf = false) => {
        const {
            title,
            body,
            outlets,
            sendToAll,
        } = this.state;
        const missing = [];
        if (!title) missing.push("a title");
        if (!body) missing.push("a body");
        if (toSelf) {
            if (missing.length > 0) {
                const msg = `You are missing: ${missing.join(', ')}`
                return $.snackbar({ content: msg });
            } else {
                this.onConfirmation(true);
                return
            }
        }

        if (!sendToAll && !outlets) missing.push("outlet(s) to send to");

        if (missing.length > 0) {
            const msg = `You are missing: ${missing.join(', ')}`
            return $.snackbar({ content: msg });
        }

        this.setState({confirm: true});
    }

    /**
    * getConfirmText checks the state of outlets selected and warns the user
    * about which stations will receive the recommendations
    *
    * @return {String} message to the user
    */
    getConfirmText = () => {
        const {
            outlets,
            sendToAll
        } = this.state;

        if (sendToAll) {
            return "WARNING: You are about to recommend this gallery to every outlet";
        } else {
            return `You will recommend this gallery to the following outlets: ${outlets.map(outlet => outlet.title).join(", ")}`;
        }
    }

    /**
    * onConfirmation contains the post request to the notification/outlet/create
    * endpoint and tells the user whether the recommendation was successfully
    * processed
    *
    * @param {Bool} toSelf distinguishes preview from send to outlets
    */
    onConfirmation = (toSelf = false) => {
        const params = toSelf ? this.packageRecommendation(true) : this.packageRecommendation();
        const successMsg = toSelf ? 'Preview sent, check your email' : "Gallery successfully recommended!"
        this.setState({ loading: true });

        recommendGallery(params)
        .then((res) => {
            if (res.result === "ok") {
                if (!toSelf) this.hide();
                this.setState({ loading: false });
                return $.snackbar({content: successMsg});
            } else {
                if (!toSelf) $.snackbar({ content: 'There was an error recommending the gallery' });
                this.setState({ loading: false });
            }
        })
        .catch(() => {
            if (!toSelf) $.snackbar({ content: 'There was an error recommending the gallery' });
            this.setState({ loading: false });
        });
    };

    /**
    * packageRecommendation creates the payload required to make a recommendation
    *
    * @param {Bool} toSelf distinguishes preview from send to outlets
    * @return {Object} JSON payload that contains notification type, content, and recipients
    */
    packageRecommendation(toSelf = false) {
        const {
            title,
            body,
            gallery_id,
            sendToAll,
            outlets
        } = this.state;

        let recipients;
        if (toSelf) {
            recipients = { user_ids: [this.props.user.id] }
        } else {
            if (sendToAll) {
                recipients = { to_all: true };
            } else {
                recipients = { outlet_ids: outlets.map(outlet => outlet.id) };
            }
        }
        return {
            type: ['outlet-recommended-content'],
            content: {title,
                body,
                gallery_ids: [gallery_id]},
            recipients
        }
    }

    /**
    * Closes both the recommendation modal and confirmation modal. If closing recommendation,
    * it also resets state back so input fields do not persist if modal is reopened
    *
    * @param {Bool} confirmation determines which modal is being closed
    */
    hide(confirmation = false) {
        if (confirmation) {
            this.setState({confirm: false})
            return;
        }
        this.props.toggle();
        this.setState(this.getStateFromProps(this.props));
    }

    renderMap() {
        const { address, location, isOriginalGallery } = this.state;
        const { gallery } = this.props;

        return (
            <div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    address={address}
                    location={location}
                    onPlaceChange={place => this.onPlaceChange(place)}
                    onMapDataChange={data => this.onMapDataChange(data)}
                    onRadiusUpdate={r => this.onRadiusUpdate(r)}
                    hasRadius={false}
                    disabled={true}
                    draggable={false}
                    rerender
                />
            </div>
        );
    }

    /**
    * Toggles the state of sendToAll, which tracks if the user wants to send recommendation to all outlets
    */
    toggleAllOutlets() {
        this.setState({sendToAll: !this.state.sendToAll});
    }

    /**
    * Renders the body of the modal (all input fields)
    */
    renderBody() {
        const { gallery, visible } = this.props;
        const {
            stories,
            caption,
            assignments,
            tags,
            is_nsfw,
            posts,
            outlets,
            sendToAll,
            title,
            body
        } = this.state;

        if (!gallery) return '';

        return (
            <div className="dialog-body">
                <TitleBody onChange={(nextState) => { this.onChange(nextState)}}
                    title={title}
                    body={body}/>

                <RestrictByOutlet
                    onChange={() => {this.toggleAllOutlets()}}
                    sendToAll={sendToAll}
                    outlets={outlets}
                    updateItems={s => this.setState({ outlets: s })}/>

                <EditPosts
                    originalPosts={gallery.posts}
                    editingPosts={posts}
                    className="dialog-col col-xs-12 col-md-5"
                    canDelete={false}
                />

                {this.renderMap()}
            </div>
        );
    }

    /**
    * Renders the footer of the modal (all buttons)
    */
    renderFooter() {
        const { gallery } = this.props;
        const { loading, isOriginalGallery } = this.state;
        if (!gallery) return '';

        return (
            <div className="dialog-foot">
                <button
                    type="button"
                    onClick={() => this.onRecommend(true)}
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Send Preview To Me
                </button>

                <button
                    type="button"
                    onClick={() => this.onRecommend(false)}
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Send Recommendation
                </button>

                <button
                    type="button"
                    onClick={() => this.hide()}
                    className="btn btn-flat pull-right toggle-gedit toggler"
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        );
    }

    render() {
        const { visible } = this.props;
        const { loading, confirm } = this.state;

        if (confirm) {
            return (
                <Confirm
                    header="Send Recommendation?"
                    body={this.getConfirmText()}
                    onConfirm={this.onConfirmation}
                    onCancel={() => {this.hide(true)}}
                    toggled={confirm}
                    disabled={loading}
                    hasInput={false}/>
            )
        } else {
            return (
                <div onScroll={this.onScroll}>
                    <div className={`dim toggle-edit ${visible ? 'toggled' : ''}`} />
                    <div
                        className={`edit panel panel-default toggle-edit
                            gedit ${visible ? 'toggled' : ''}`}
                            >
                            <div className="col-xs-12 col-lg-12 edit-new dialog">
                                <div className="dialog-head">
                                    <span className="md-type-title">Recommend Gallery</span>
                                    <span
                                        className="mdi mdi-close pull-right icon toggle-edit toggler"
                                        onClick={() => this.hide()}
                                        />
                                </div>

                                {this.renderBody()}

                                {this.renderFooter()}
                            </div>

                            <LoaderOpacity visible={loading} />
                        </div>
                    </div>
                );
        }
    }
}

Recommend.propTypes = {
    gallery: PropTypes.object.isRequired,
    toggle: PropTypes.func.isRequired,
    onUpdateGallery: PropTypes.func,
    visible: PropTypes.bool.isRequired,
};

Recommend.defaultProps = {
    onUpdateGallery: () => {},
};

export default Recommend;
