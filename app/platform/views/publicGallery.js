import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import 'app/sass/platform/screen.scss';
import 'app/sass/platform/_publicGallery.scss';
import PublicGallerySlider from '../components/publicGallery/slider';
import PublicGalleryInfo from '../components/publicGallery/info';
import Footer from '../components/global/footer';

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

            <div className="page">
                <div className="gallery-slick-wrap">
                    <PublicGallerySlider posts={gallery.posts} userAgent={userAgent} />
                </div>

                <div className="gallery-info-wrap">
                    <div className="gallery-info">
                        <div className="column">
                            <p className="caption">{gallery.caption}</p>

                            <br />

                            <a
                                href="https://itunes.apple.com/app/apple-store/id872040692?pt=83522801&ct=GalleryPostBtn&mt=8"
                                target="_blank"
                            >
                                <img
                                    src="https://d1dw1p6sgigznj.cloudfront.net/images/store-apple.svg"
                                    role="presentation"
                                />
                            </a>
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
