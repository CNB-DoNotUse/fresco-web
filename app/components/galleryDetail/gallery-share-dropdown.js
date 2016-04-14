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
            locations: [],
            dropdownToggled: false
        }
    }

    componentDidMount() {
        var link = new Clipboard(this.refs.copyLink),
            embed = new Clipboard(this.refs.copyEmbed),
            self = this;

        link.on('success', (e) => {
            successfulCopy();
        }); 
        embed.on('success', (e) => {
            successfulCopy();
        }); 

        //Hide and alert user of success
        function successfulCopy() {
            self.setState({
                dropdownToggled: !self.state.dropdownToggled
            });

            $.snackbar({ content: 'Successfully copied!'})
        }
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
                <a 
                    href={'https://www.facebook.com/dialog/share?app_id=267157383448416&display=popup&href='+ link +'&redirect_uri=' + encodeURIComponent('https://fresconews.com')}
                    target="_blank">
                    <span className="mdi mdi-facebook-box facebook"></span>
                </a>
                <a href={'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + link} target="_blank">
                    <span className="mdi mdi-tumblr tumblr"></span>
                </a>
                <a 
                    href={'https://twitter.com/intent/tweet?text='+ encodeURIComponent(link)} 
                    target="_blank">
                    <span className="mdi mdi-twitter twitter"></span>
                </a>
            </li>
        );
             

        dropdownBody = <ul className="list">
                            {items}
                        </ul>

        return (
            <Dropdown 
                inList={true} 
                toggled={this.state.dropdownToggled}
                title={"SHARE GALLERY"}
                icon='mdi mdi-share'
                dropdownClass={"share-dropdown"}>
                    {dropdownBody}
            </Dropdown>
        );             
    }
}

