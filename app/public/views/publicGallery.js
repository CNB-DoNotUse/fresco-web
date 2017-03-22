import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import 'app/sass/platform/screen.scss'; //TODO - Remove from here
import 'app/sass/public/gallery/publicGallery.scss';
import PublicGallerySlider from 'app/platform/components/publicGallery/slider';
import PublicGalleryInfo from 'app/platform/components/publicGallery/info';
import Footer from 'app/platform/components/global/footer';

/**
 * Public Gallery Page
 */
const PublicGallery = ({ gallery, userAgent }) => {
    if (gallery.posts.length === 0) return <div />;

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
                        posts={gallery.posts} 
                        userAgent={userAgent} />
                </div>

                <div className="gallery-info-wrap">
                    <div className="gallery-info">
                        <div className="column column__caption">
                            <p className="caption">{gallery.caption}</p>
                        </div>

                        <PublicGalleryInfo gallery={gallery} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

PublicGallery.propTypes = {
    gallery: PropTypes.object,
    userAgent: PropTypes.string,
};

ReactDOM.render(
    <PublicGallery
        gallery={window.__initialProps__.gallery}
        userAgent={window.__initialProps__.userAgent}
    />,
    document.getElementById('app')
);
