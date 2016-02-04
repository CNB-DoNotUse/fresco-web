import React from 'react'
import GalleryEditTags from './gallery-edit-tags'
import GalleryEditArticles from './gallery-edit-articles'
import GalleryEditStories from './gallery-edit-stories'
import EditPost from './edit-post.js'
import Slick from 'react-slick'
import global from '../../../lib/global'

export default class BulkEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      caption: '',
      tags: [],
      relatedStories: [],
      galleries: []
    }
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.clear = this.clear.bind(this);
    this.revert = this.revert.bind(this);
    this.updateCaption = this.updateCaption.bind(this);
    this.updateTags = this.updateTags.bind(this);
    this.updateRelatedStories = this.updateRelatedStories.bind(this);
  }

  show() {
    this.clear();
    $('.toggle-bedit').toggleClass('toggled');
    let galleryIds = new Set(this.props.posts.map(post => { return post.parent }));
    $.get('/api/gallery/resolve', {galleries: [...galleryIds]}, (data) => {
      if (!data.data) {
        this.hide();
        $.snackbar({
          content: global.resolveError(data.err, 'We were unable to edit these posts')
        });
        return;
      }

      this.setState({
        galleries: data.data
      });

      this.revert();
    });
  }

  hide() {
    $('.toggle-bedit').toggleClass('toggled');
  }

  clear() {
    this.setState({
      caption: '',
      tags: [],
      relatedStories: []
    })
  }

  revert() {
    let stateToSet = {};

    let caption = this.state.galleries[0].caption;
    let allSame = this.state.galleries.every(gallery => {
      return gallery.caption == caption;
    });

    if (allSame) {
      stateToSet.caption = caption;
    }

    let tags = new Set(this.state.galleries[0].tags);
    for (let gallery of this.state.galleries) {
      let galleryTags = new Set(gallery.tags);
      tags = new Set([...tags].filter(x => galleryTags.has(x)));
    }
    stateToSet.tags = [...tags];

    let stories = this.state.galleries[0].related_stories
    for (let gallery of this.state.galleries) {
      let galleryStories = new Set(gallery.related_stories);
      stories = new Set([...stories].filter(x => galleryStories.has(x)));
    }
    stateToSet.relatedStories = [...stories];

    this.setState(stateToSet);
  }

  updateCaption(e) {
    let caption = e.target.value;

    this.setState({
      caption: caption
    });
  }

  updateTags(tags) {
    this.setState({
      tags: tags
    });
  }

  updateRelatedStories(relatedStories) {
    this.setState({
      relatedStories: relatedStories
    });
  }

  render() {
    let posts = this.props.posts.map((post, i) => {
      return (
        <div key={i++}>
          <EditPost post={post} />
        </div>
      )
    });

    return (
      <div>
        <div className="dim toggle-bedit" />

        <div className="edit panel panel-default toggle-bedit bedit">
          <div className="col-xs-12 col-lg-12 edit-new dialog">

            <div className="dialog-head">
              <span className="md-type-title">Bulk Edit</span>
              <span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.hide}></span>
            </div>

            <div className="dialog-foot">
              <button onClick={this.revert} type="button" className="btn btn-flat">Revert</button>
              <button onClick={this.clear} type="button" className="btn btn-flat">Clear All</button>
              <button type="button" className="btn btn-flat pull-right">Save</button>
              <button onClick={this.hide} type="button" className="btn btn-flat pull-right toggle-bedit">Discard</button>
            </div>

            <div className="dialog-body">
              <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                <div className="dialog-row">
                  <textarea
                    ref="caption"
                    type="text"
                    className="form-control floating-label"
                    placeholder="Caption"
                    value={this.state.caption}
                    onChange={this.updateCaption} />
                </div>

                <GalleryEditTags
                  ref="tags"
                  tags={this.state.tags}
                  updateTags={this.updateTags} />

                <GalleryEditStories
                  relatedStories={this.state.relatedStories}
                  updateRelatedStories={this.updateRelatedStories}/>
              </div>

              <Slick
                dots={true}
                className="gialog-col col-xs-12 col-md-5">
                {posts}
              </Slick>
            </div>

          </div>
        </div>
      </div>
    );
  }
}
