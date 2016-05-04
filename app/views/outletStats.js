import _ from 'lodash'
import moment from 'moment'
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
            since: moment().utc().startOf('day')
        }

        this.timeToggleSelected = this.timeToggleSelected.bind(this);
        this.loadOutlets = this.loadOutlets.bind(this);
    }

    componentDidMount() {
        $.ajax({
            url: '/api/outlet/get',
            type: 'GET',
            data: {
                id: '56bb6dd380b5a9c7717974ec'
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

    /**
     * Selection function for the time toggle dropdown
     */
    timeToggleSelected(selected) {
        var since = 0;

        switch(selected) {
            case 'today so far':
                since = moment().utc().startOf('day')
                break;
            case 'last 24 hours':
                since = moment().utc().subtract(1, 'day');
                break;
            case 'last 7 days':
                since = moment().utc().subtract(7, 'days');
                break;
            case 'last 30 days':
                since = moment().utc().subtract(30, 'days');
                break;
            case 'this year':
                since = moment().utc().subtract(1, 'year');
                break;
            case 'all time':
                since = null;
                break;
            default:
                since = moment().utc().startOf('day')
        }

        this.setState({
            since: since
        })
    }

    render() {
        var columns = this.state.outlets.map((outlet, i) => {
            return <OutletColumn 
                        outlet={outlet}
                        since={this.state.since}
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
