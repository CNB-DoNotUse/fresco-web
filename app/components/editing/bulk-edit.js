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
      tags: [],
      relatedStories: []
    }
    this.hide = this.hide.bind(this);
    this.clear = this.clear.bind(this);
    this.updateTags = this.updateTags.bind(this);
    this.updateRelatedStories = this.updateRelatedStories.bind(this);
  }

  hide() {
    console.log(this.props);
    $('.toggle-bedit').toggleClass('toggled');
  }

  clear() {
    this.refs.caption.value = '';

    this.setState({
      tags: [],
      relatedStories: []
    })
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
    var posts = this.props.posts.map((post, i) => {
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
              <button type="button" className="btn btn-flat">Revert</button>
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
                    placeholder="Caption" />
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
