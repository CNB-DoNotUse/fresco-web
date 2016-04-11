import React from 'react'
import global from '../../../lib/global'
import Dropdown from '../global/dropdown'
import Clipboard from 'clipboard'

/**
 * Gallery Share dropdown
 */

export default class GalleryShareDropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            locations: []
        }
    }

    componentDidMount() {
        var link = new Clipboard(this.refs.copyLink),
            embed = new Clipboard(this.refs.copyEmbed);
    }

    render() {
        var gallery = this.props.gallery,
            items = [],
            dropdownBody,
            key = 0,
            link = 'https://fresconews.com/gallery/' + gallery._id;

        items.push(
            <li
                key={key}
                ref="copyEmbed"
                data-clipboard-text={global.getEmbedCode(gallery)}>
                Copy embed code</li>
        );

        key++;

        items.push(
            <li
                key={key}
                ref="copyLink"
                data-clipboard-text={link}>
                Copy link</li>
        );

        key++;

        items.push(
            <li
                key={key}>
                <a href={'https://www.facebook.com/dialog/share?app_id=267157383448416&display=popup&href='+ link +'&redirect_uri=' + encodeURIComponent('https://fresconews.com')}>
                    <span className="mdi mdi-facebook-box facebook"></span>
                </a>
                <a href="">
                    <span className="mdi mdi-twitter-box twitter"></span>
                </a>
                <a href={'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + link}>
                    <span className="mdi mdi-tumblr tumblr"></span>
                </a>
            </li>
        );
             

        dropdownBody = <ul className="list">
                            {items}
                        </ul>

        return (
            <Dropdown 
                inList={true} 
                title={"SHARE GALLERY"}
                dropdownClass={"share-dropdown"}  >
                    {dropdownBody}
            </Dropdown>
        );             
    }
}

