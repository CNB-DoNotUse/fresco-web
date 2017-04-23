import React, { PropTypes } from 'react';
import Base from './base';
import { getAddressFromLatLng } from 'app/lib/location';
import Slider from 'react-slick';
import get from 'lodash/get';
import { LoaderOpacity } from '../global/loader';
import RestrictByOutlet from 'app/platform/components/global/outlet-chip-input.js';
import TitleBody from 'app/platform/components/pushNotifs/title-body.js';
import Confirm from 'app/platform/components/dialogs/confirm.js';
import { recommendGallery } from 'app/lib/galleries';

/**
 * Gallery Recommendation Object
 * Component for recommending galleries to outlets
 */

export function toggleRecommend() {
    this.setState({ recommendToggled: !this.state.recommendToggled });
}

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
            rating: gallery.rating,
            loading: false,
            sendToAll: false,
            title: '',
            body: '',
            confirm: false,
            outlets: [],
            sendPreview: false
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

    /**
    * onRecommend handles both send to outlets and send preview
    * it first checks if there are any required fields missing and
    * alerts if there is. If all fields are filled, it sends the preview
    * right away, or transitions to a confirmation modal for actual send
    *
    * to send a preview, only title and body are required, if actual send,
    * outlets or all outlets must be selected
    */
    onRecommend = () => {
        const {
            title,
            body,
            outlets,
            sendToAll,
            sendPreview
        } = this.state;
        const missing = [];
        if (sendPreview) {
            this.onConfirmation(true);
            return;
        }
        if (!sendToAll && outlets.length === 0) missing.push("outlet(s) to send to");

        if (missing.length > 0) {
            const msg = `You are missing: ${missing.join(', ')}`
            $.snackbar({ content: msg });
            debugger
            return;
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
    */
    onConfirmation = () => {
        const { sendPreview } = this.state;
        const params = sendPreview ? this.packageRecommendation(true) : this.packageRecommendation();
        const successMsg = sendPreview ? 'Preview sent, check your email' : "Gallery successfully recommended!"
        this.setState({ loading: true });

        recommendGallery(params)
        .then((res) => {
            if (res.result === "ok") {
                this.setState({ loading: false, confirm: false });
                if (!sendPreview) this.hide();
                return $.snackbar({content: successMsg});
            } else {
                if (!sendPreview) $.snackbar({ content: 'There was an error recommending the gallery' });
                this.setState({ loading: false });
            }
        })
        .catch(() => {
            $.snackbar({ content: 'There was an error recommending the gallery' });
            this.setState({ loading: false });
        });
    };

    /**
    * packageRecommendation creates the payload required to make a recommendation
    *
    * @return {Object} JSON payload that contains notification type, content, and recipients
    */
    packageRecommendation() {
        const {
            title,
            body,
            gallery_id,
            sendToAll,
            outlets,
            sendPreview
        } = this.state;

        let recipients;
        if (sendPreview) {
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
    */
    hide() {
        const { confirm } = this.state;
        if (confirm) {
            this.setState({confirm: false});
            return;
        }
        this.props.toggle();
        this.setState(this.getStateFromProps(this.props));
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
            outlets,
            sendToAll,
            title,
            body,
            sendPreview
        } = this.state;

        return (
            <div className="dialog-modal__body">
                <TitleBody onChange={(nextState) => { this.onChange(nextState)}}
                    body={body}
                    placeholderTitle="Re: New Recommended Content"
                    placeholderBody="Top content picks from your Fresco editor"
                    title={title}
                />

                <RestrictByOutlet
                    onChange={() => {this.toggleAllOutlets()}}
                    sendToAll={sendToAll && !sendPreview}
                    outlets={outlets}
                    disabled={sendPreview}
                    updateItems={s => this.setState({ outlets: s })}
                />

                <div className="form-group-default">
                    <div className="checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={sendPreview}
                            onChange={() => this.onChange({sendPreview: !sendPreview, sendToAll: false})}
                        />
                    Send preview to me
                    </label>
                </div>
                </div>
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
            <div className="dialog-modal__footer clearfix">
                <button
                    type="button"
                    onClick={() => this.hide()}
                    className="cancel btn"
                    disabled={loading}
                    >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={() => this.onRecommend()}
                    className="primary btn"
                    disabled={loading}
                >
                    Send Recommendation
                </button>

            </div>
        );
    }

    render() {
        const { visible } = this.props;
        const { loading, confirm } = this.state;
        return (
            <Base toggled={visible}>
                <div className={`dialog-modal--confirm ${visible ? 'toggled' : ''}`}>
                    <div className="dialog-modal__header">
                        <h3>Recommend Gallery</h3>
                        </div>

                        {this.renderBody()}

                        {this.renderFooter()}

                    <LoaderOpacity visible={loading} />
                </div>

                {confirm &&
                    <Confirm
                        header="Send Recommendation?"
                        body={this.getConfirmText()}
                        onConfirm={this.onConfirmation}
                        onCancel={() => {this.hide()}}
                        toggled={confirm}
                        disabled={loading}
                        zIndex={8}
                        hasInput={false}/>
                }
            </Base>
        );
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
