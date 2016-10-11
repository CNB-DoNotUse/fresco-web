import React, { PropTypes, Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Masonry from 'react-masonry-component';

export default class FrescoMasonry extends Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        ctrClassName: PropTypes.string,
        hasMore: PropTypes.bool,
        loader: PropTypes.element,
        loadMore: PropTypes.func,
        packed: PropTypes.string,
        pageStart: PropTypes.number,
        threshold: PropTypes.number,
        useWindow: PropTypes.bool,
        initialLoad: PropTypes.bool,
    }

    static defaultProps = {
        className: '',
        packed: 'data-packed',
        useWindow: false,
        initialLoad: false,
        hasMore: true,
    }

    render() {
        const {
            className,
            ctrClassName,
            pageStart,
            loadMore,
            hasMore,
            loader,
            useWindow,
            initialLoad,
            children,
        } = this.props;

        const masonryOptions = {
            fitWidth: true,
            gutter: 24,
        };

        return (
            <InfiniteScroll
                pageStart={pageStart}
                loadMore={loadMore}
                loader={loader}
                useWindow={useWindow}
                initialLoad={initialLoad}
                hasMore={hasMore}
            >
                <div className={ctrClassName}>
                    <Masonry
                        options={masonryOptions}
                        className={className}
                        updateOnEachImageLoad
                        ref={(r) => { this.masonry = r; }}
                    >
                        {children}
                    </Masonry>
                </div>
            </InfiniteScroll>
        );
    }
}

