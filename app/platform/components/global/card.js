import React from 'react';

class Card extends React.Component {

    render() {
        const { saveFunc, headerText, rating, ratingColor, children } = this.props;
        return (
            <div className="card settings-user-account">
                <div className="header">
                    <div className="title">{ headerText }</div>
                    { rating ?
                        <div className={`right ${ratingColor}`}>{ rating }</div>
                        : <div></div> }

                </div>
                <div className="card-form">
                    { children }

                    <button
                        className={`btn btn-save`}
                        onClick={ saveFunc }
                        ref="saveBtn">SAVE CHANGES
                    </button>
                </div>
            </div>
        );
    }
}

export default Card;
