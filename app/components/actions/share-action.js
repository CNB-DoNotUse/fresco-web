import React from 'react'
import global from '../../../lib/global'
import Clipboard from 'clipboard'

/**
 * Global share action for posts
 */

export default class ShareAction extends React.Component {

    constructor(props) {
        super(props);

        this.toggleDrop = this.toggleDrop.bind(this);
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
            self.refs.drop.style.display = 'none';

            $.snackbar({ content: 'Successfully copied!'})
        }
    }

    toggleDrop() {
        var drop = this.refs.drop,
            style = drop.style.display;

        drop.style.display = style === 'none' || style === '' ? 'block' : 'none';
    }

    render() {
        var gallery = this.props.gallery,
            items = [],
            dropdownBody,
            key = 0,
            link = 'https://fresconews.com/gallery/' + gallery._id;

        items.push(
            <li className="first" key={key}>SHARE GALLERY</li>
        );

        key++;

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
            <li key={key}>
                <span className="cancel" onClick={this.toggleDrop}>CANCEL</span>
                <a 
                    href={'https://www.facebook.com/dialog/share?app_id=267157383448416&display=popup&href='+ link +'&redirect_uri=' + encodeURIComponent('https://fresconews.com')}
                    target="_blank">
                    <span className="mdi mdi-facebook-box facebook"></span>
                </a>
                <a  href={'https://twitter.com/intent/tweet?text='+ encodeURIComponent(link)} 
                    target="_blank">
                    <span className="mdi mdi-twitter-box twitter"></span>
                </a>
            </li>
        );

        var reverseDropdown = <div className="post-share-dropdown share-dropdown dropdown-body" ref="drop">
                                <ul className="list">
                                    {items}
                                </ul>
                            </div>

        return (
            <div className="share-action">
                <span 
                    className="mdi mdi-share icon pull-right" 
                    onClick={this.toggleDrop} >
                </span>

                {reverseDropdown}
            </div>
        );        
    } 

    //Called whenever the purhcase icon is selected
    share(event) {

        
    }

}
