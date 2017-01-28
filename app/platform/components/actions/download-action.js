import React, { PropTypes } from 'react';
import utils from 'utils';
import api from 'app/lib/api';

/**
 * Global download action
 */
class DownloadAction extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
    };

    // Called whenever the download icon is selected
    download = () => {
        const { post } = this.props;

        if (!post) {
            return $.snackbar({
                content: 'We couldn\'t find this post!',
                timeout: 0,
            });
        }

        // Override click event for browsers that do not support it
        HTMLElement.prototype.click = function(){
            const evt = this.ownerDocument.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.dispatchEvent(evt);
        };

        api
        .get(`post/${post.id}/download`)
        .then(res => {
            const downloadLink = res.result;
           

            const link = document.createElement('a');

            link.download = Date.now() + '.' + downloadLink.split('.').pop();
            link.href = downloadLink;
            link.click();
        })
        .catch(() => $.snackbar({ content: 'We can\'t download this post right now!' }));
    }

    render() {
        return (
            <span className="mdi mdi-download icon pull-right" onClick={this.download} />
        );
    }
}


export default DownloadAction;
