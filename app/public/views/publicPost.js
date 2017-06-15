import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import 'app/sass/platform/screen.scss';
import 'app/sass/public/gallery/publicGallery.scss';
import PublicGallerySlider from 'app/platform/components/publicGallery/slider';
import PublicGalleryInfo from 'app/platform/components/publicGallery/info';
import Footer from 'app/platform/components/global/footer';

/**
 * Public Post Page
 */
const PublicPost = ({ post, gallery, userAgent }) => {
    return (
        <div>
            <div className="nav">
                <a className="logo" target="_parent" id="_logo" href="/">
                    <span className="icon-fresco" />
                </a>
            </div>

            <div className="gallery-detail-wrap page">
                <div className="gallery-slick-wrap">
                    <PublicGallerySlider
                        posts={[post]}
                        showArrows={false}
                        userAgent={userAgent} />
                </div>

                <div className="gallery-info-wrap">
                    <div className="gallery-info">
                        <p className="caption">{gallery.caption}</p>
                    </div>

                    <PublicGalleryInfo gallery={gallery} />
                </div>
            </div>
            <Footer/>
        </div>
    )
};

PublicPost.propTypes = {
    post: PropTypes.object,
    gallery: PropTypes.object,
    userAgent: PropTypes.string
};

ReactDOM.render(
    <PublicPost
        post={window.__initialProps__.post}
        gallery={window.__initialProps__.gallery}
        userAgent={window.__initialProps__.userAgent}
    />,
    document.getElementById('app')
);