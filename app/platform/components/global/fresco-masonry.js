import React, { PropTypes, Component, cloneElement } from 'react';
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
        position: PropTypes.bool,
        sizes: PropTypes.array,
        threshold: PropTypes.number,
        useWindow: PropTypes.bool,
        initialLoad: PropTypes.bool,
    }

    static defaultProps = {
        className: '',
        packed: 'data-packed',
        position: true,
        sizes: [
            { columns: 1, gutter: 20 },
            { mq: '768px', columns: 2, gutter: 20 },
            { mq: '1024px', columns: 3, gutter: 20 },
        ],
        useWindow: false,
        initialLoad: false,
        hasMore: true,
    }

    onRemoveChild = (cb) => {
        console.log('child removed from masonry');
        cb();
    }

    renderChildrenWithProps() {
        const children = this.props.children.filter(c => !!c);
        if (!children || !children.length) return null;

        return children.map(c => (
            cloneElement(c, { onRemove: this.onRemoveChild })
        ));
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
                        ref={(r) => { this.masonry = r ? r.masonry : null; }}
                    >
                        {this.renderChildrenWithProps()}
                    </Masonry>
                </div>
            </InfiniteScroll>
        );
    }
}
