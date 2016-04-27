import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import Dropdown from '../components/global/dropdown'
import OutletColumn from '../components/outletStats/outlet-column.js'

class OutletStats extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            outlets: [],
            since: 0
        }

        this.timeToggleSelected = this.timeToggleSelected.bind(this);
        this.loadOutlets = this.loadOutlets.bind(this);
    }

    componentDidMount() {
        $.ajax({
            url: '/api/outlet/get',
            type: 'GET',
            data: {
                id: '5702d0680fc6c0ba470ed37d'
            },
            dataType: 'json',
            success: (response, status, xhr) => {
                if(!response.err) {
                    this.setState({
                        outlets: [response.data]
                    });
                }  
            }
        });  
    }

    loadOutlets() {

    }

    timeToggleSelected(selected) {

    }

    render() {
        var columns = this.state.outlets.map((outlet, i) => {
            return <OutletColumn 
                        outlet={outlet}
                        key={i} />
        });

        return (
            <App user={this.props.user}>
                <TopBar 
                    title="Outlet Purchases">
                    <Dropdown
                        options={['today so far', 'last 24 hours', 'last 7 days', 'last 30 days', 'this year', 'all time']}
                        selected='today so far'
                        onSelected={this.timeToggleSelected}
                        key="timeToggle"
                        inList={true}>
                    </Dropdown>
                </TopBar>

                <div className="outletStats">
                    {columns}
                </div>
            </App>
        )
    }
}

ReactDOM.render(
  <OutletStats
    user={window.__initialProps__.user} />,
    document.getElementById('app')
);
