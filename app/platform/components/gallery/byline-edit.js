import React, { PropTypes } from 'react';
import Dropdown from './../global/dropdown.js';

/**
 * Component for managing byline editing
 * @param {object} gallery Gallery object to base byline representation off of
 */

class BylineEdit extends React.Component {
    constructor(props) {
        super(props);
        const { gallery } = this.props;

        const name = this.isTwitterImport()
            ? gallery.posts[0].meta.twitter.handle
            : '';

        this.state = { name };

        this.isTwitterImport = this.isTwitterImport.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { gallery } = this.props;
        if (!gallery.posts) return;

        if (gallery.id !== prevProps.gallery.id) {
            $.material.init();

            const post = gallery.posts[0];
            if (this.isTwitterImport()) {
                this.setState({ name: post.meta.twitter.handle });
            } else {
                if (this.refs.byline) {
                    this.refs.byline.value = post.byline;
                    $(this.refs.byline).removeClass('empty');
                }

                if (this.refs.name) {
                    this.refs.name.value = '';
                    $(this.refs.name).removeClass('empty');
                }

                if (this.refs.affiliation) {
                    this.refs.affiliation.value = '';
                    $(this.refs.affiliation).removeClass('empty');
                }

                this.setState({ name: '' });
            }
        }
    }

    isTwitterImport() {
        const { gallery } = this.props;
        if (!gallery || !gallery.posts) return null;

        const post = this.props.gallery.posts[0];
        return this.props.gallery.imported && post.meta && post.meta.twitter;
    }

    handleSelected(selected) {
        this.setState({ name: selected });
    }

	/**
	 * Renders byline field
	 * @description Three types of instances for the byline
	 */
    render() {
        const gallery = this.props.gallery;
        const post = gallery.posts ? gallery.posts[0] : null;
        let shouldBeHidden = false;
        const postIdOccurances = {};

        // Loop through gallery posts
        for (let p in gallery.posts) {
            // Assign each parent as key in object.
            postIdOccurances[gallery.posts[p].parent] = 1;

            // If there is more than one parent, hide.
            if (Object.keys(postIdOccurances).length > 1) {
                shouldBeHidden = true;
                break;
            }
        }

        if (shouldBeHidden || !post) {
            return <div />;
        }

        // If the post contains twitter info, show twitter byline editor
        if (this.isTwitterImport()) {
            const isHandleByline = post.byline.indexOf('@') === 0;
            let byline = isHandleByline ? post.meta.twitter.handle : post.meta.twitter.user_name;
            let affiliation = post.meta.other_origin ? post.meta.other_origin.affiliation : '';

            return (

                <div className="dialog-row" ref="byline-parent" id="byline-edit">
                    <div className="split byline-section" id="gallery-byline-twitter">
                        <Dropdown
                            dropdownClass="twitter-dropdown"
                            options={[post.meta.twitter.handle, post.meta.twitter.user_name]}
                            selected={byline}
                            onSelected={this.handleSelected}
                        />
                        <input type="hidden" ref="name" value={this.state.name} />
                        <div className="split-cell">
                            <input
                                type="text"
                                className="form-control floating-label byline-affiliation"
                                defaultValue={affiliation}
                                ref="affiliation"
                                placeholder="Affiliation"
                                id="gallery-edit-affiliation"
                            />
                        </div>
                    </div>
                </div>
            );
        } else if (!post.owner && post.curator) {
            // If the post doesn't have an owner, but has a curator i.e. manually imported
            let name = '';
            let affiliation = '';

            if (post.meta.other_origin) {
                name = post.meta.other_origin.name;
                affiliation = post.meta.other_origin.affiliation;
            }

            return (
                <div className="dialog-row" id="byline-edit">
                    <div className="split byline-section" id="gallery-byline-other-origin">
                        <div className="split-cell" id="gallery-name-span">
                            <input
                                type="text"
                                className="form-control floating-label"
                                defaultValue={name}
                                ref="name"
                                placeholder="Name"
                                id="gallery-edit-name" />
                        </div>

                        <div className="split-cell">
                            <input
                                type="text"
                                className="form-control floating-label"
                                defaultValue={affiliation}
                                ref="affiliation"
                                placeholder="Affiliation"
                                id="gallery-edit-affiliation"
                            />
                        </div>
                    </div>
                </div>
            );
        }
        // If organically submitted content i.e. user submitted the gallery, can't change the byline
        return (
            <div className="dialog-row" id="byline-edit">
                <span className="byline-section" id="gallery-byline-span">
                    <input
                        id="gallery-byline-input"
                        className="form-control"
                        placeholder="Byline"
                        ref="byline"
                        defaultValue={post.byline}
                        type="text"
                        disabled
                    />
                </span>
            </div>
        );
    }
}

BylineEdit.propTypes = {
    gallery: PropTypes.object,
};

export default BylineEdit;
