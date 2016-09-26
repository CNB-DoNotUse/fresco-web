import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Global download action
 */
class DownloadAction extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
    };

    // Called whenever the purhcase icon is selected
    download = () => {
        const { post } = this.props;
        // Override click event for browsers that do not support it
        HTMLElement.prototype.click = function() {
            const evt = this.ownerDocument.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.dispatchEvent(evt);
        };

        if (!post) {
            $.snackbar({
                content: 'We couldn\'t find this post!',
                timeout: 0,
            });
            return;
        }

        const href = post.stream
            ? utils.streamToMp4(post.stream)
            : post.image;

        const link = document.createElement('a');

        link.download = Date.now() + '.' + href.split('.').pop();
        link.href = href;
        link.click();
    }

    render() {
        return (
            <span className="mdi mdi-download icon pull-right" onClick={this.download} />
        );
    }
}


export default DownloadAction;
