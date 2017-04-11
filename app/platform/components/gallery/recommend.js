import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';
import utils from 'utils';
import moment from 'moment';
import request from 'superagent';
import api from 'app/lib/api';

import times from 'lodash/times';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import EditPosts from './edit-posts';
import EditByline from './edit-byline';
import ExplicitCheckbox from '../global/explicit-checkbox';
import AutocompleteMap from '../global/autocomplete-map';
import ChipInput from '../global/chip-input';
import Dropdown from 'app/platform/components/global/dropdown.js';
import AssignmentChipInput from '../global/assignment-chip-input';
import { LoaderOpacity } from '../global/loader';
import { RestrictByOutlet } from 'app/platform/components/pushNotifs/restrict-by.js';
import TitleBody from 'app/platform/components/pushNotifs/title-body.js';
import Confirm from 'app/platform/components/dialogs/confirm.js';
import { recommendGallery } from 'app/lib/models.js';

/**
 * Gallery Edit Parent Object
 * Component for adding gallery editing to the current view
 */
class Recommend extends React.Component {

    state = this.getStateFromProps(this.props);

    componentDidMount() {
        $.material.init();
    }

    // If props has a gallery, and GalleryEdit does not currently have a
    // gallery or the galleries are not the same
    componentWillReceiveProps(nextProps) {
        this.setState(this.getStateFromProps(nextProps));
    }

    /**
     * getStateFromProps
     *
     * @param {object} props
     * @returns {object} initial state from passed props
     */
    getStateFromProps(props) {
        const { gallery } = props;
        if (!gallery) return {};

        return {
            id: gallery.id,
            tags: gallery.tags || [],
            stories: gallery.stories,
            assignments: gallery.assignments,
            caption: gallery.caption || 'No Caption',
            posts: gallery.posts,
            articles: gallery.articles,
            rating: gallery.rating,
            is_nsfw: gallery.is_nsfw,
            // isOriginalGallery: isOriginalGallery(this.props.gallery),
            // uploads: [],
            loading: false,
            ...this.getInitialLocationData(),
            // external_account_name: gallery.external_account_name,
            // external_source: gallery.external_source,
            // owner: gallery.owner,
            // bylineDisabled: (isImportedGallery(gallery) && !!gallery.owner),
            // updateHighlightedAt: false,
            // shouldHighlight: gallery.highlighted_at !== null,
            sendToAll: false,
            title: '',
            body: '',
            confirm: false
        };
    }

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

    // const notificationSlug = 'user-news-gallery';
    onRecommend = () => {
        const {
            title,
            body,
            outlets,
            sendToAll,
        } = this.state;
        const missing = [];
        if (!title) missing.push("a title");
        if (!body) missing.push("a body");
        if (!sendToAll && !outlets) missing.push("outlet(s) to send to");

        if (missing.length > 0) {
            const msg = `You are missing: ${missing.join(', ')}`
            return $.snackbar({ content: msg });
        }
        this.setState({confirm: true});
    }

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

    onConfirmation = () => {
        const params = this.packageRecommendation();

        this.setState({ loading: true });

        recommendGallery(params)
        .then((res) => {
            if (res.result === "ok") {
                this.hide();
                return $.snackbar({content: "Gallery successfully recommended!"})
            } else {
                $.snackbar({ content: 'There was an error recommending the gallery!' });
                this.setState({ loading: false });
            }
        })
        .catch(() => {
            $.snackbar({ content: 'There was an error recommending the gallery!' });
            this.setState({ loading: false });
        });
    };


    packageRecommendation() {
        const {
            title,
            body,
            id,
            sendToAll,
            outlets
        } = this.state;

        let recipients;
        if (sendToAll) {
            recipients = { to_all: true };
        } else {
            recipients = { outlet_ids: outlets.map(outlet => outlet.id) };
        }
        return {
            type: ['outlet-recommended-content'],
            content: {title,
                body,
                gallery_ids: [id]},
            recipients
        }
    }

    hide(confirmation = false) {
        if (confirmation) {
            this.setState({confirm: false})
            return;
        }
        this.props.toggle();
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

    toggleAllOutlets() {
        this.setState({sendToAll: !this.state.sendToAll});
    }

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

    renderFooter() {
        const { gallery } = this.props;
        const { loading, isOriginalGallery } = this.state;
        if (!gallery) return '';

        return (
            <div className="dialog-foot">

                <button
                    type="button"
                    onClick={this.onRecommend}
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
