import { safeLoad } from 'js-yaml';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import ReactPlayer from 'react-player';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import './index.scss';
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

const SYNC_INTERVAL = 30; //time in minutes to refresh data
interface IHealthDashboardProps {
    apiUrl:string;
    basePath:string;
}
interface IHealthDashboardState {
    data:IDataItem[];
}

interface IDataItem {
    country:string;
    region:string;
    confirmed:number;
    deaths:number;
    recovered:number;
    lat:number;
    lon:number;
}

class MapWidget extends React.Component<{},{}> {
   
    render() {
        return <div className='gmap' >
<Map center={[45.4, -75.7]} zoom={12}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </Map>

        </div>;
    }
}
interface IListWidgetProps {
    items:IDataItem[];
}
class ListWidget extends React.Component<IListWidgetProps,{}> {
    render() {
        return <div className='list-widget'>
            {
                this.props.items.map((item,key) => this.renderItem(item,key))
            }
        </div>;
    }
    renderItem(item:IDataItem,key:number) {
        return <div key={key} className='item'>
            <div className='country c'>
                <div className='label'>Country</div>
                <div className='value'>{item.country}</div>
            </div>
            <div className='area c'>
                <div className='label'>Area</div>
                <div className='value'>{item.region}</div>
            </div>
            <div className='confirmed c'>
                <div className='label'>Confirmed</div>
                <div className='value'>{item.confirmed}</div>
            </div>
            <div className='deaths c'>
                <div className='label'>Deaths</div>
                <div className='value'>{item.deaths}</div>
            </div>
            <div className='recovered c'>
                <div className='label'>Recovered</div>
                <div className='value'>{item.recovered}</div>
            </div>
            <div className='notify c'>
                <div className='action'>Notify Me</div>
            </div>
        </div>
    }
}
class HealthDashboard extends React.Component<IHealthDashboardProps,IHealthDashboardState> {
    constructor(props:IHealthDashboardProps) {
        super(props);
        this.state = {data:[]};
    }
   
    getMasterData():Promise<IDataItem[]> {
        let raw = localStorage.getItem('raw');
        let lastUpdate = localStorage.getItem('lastSync');
        let requiresResync = false;
        if (!lastUpdate || !raw) {
            requiresResync = true;
        } else {
            let dt = new Date(lastUpdate);
            let elapsedMinutes =  (Number(new Date()) - Number(dt))/1000*60;
            if (elapsedMinutes > SYNC_INTERVAL) {
                requiresResync = true;
            }
        };
        if (!requiresResync) {
            return new Promise((resolve,reject)=>{
                try {

                    resolve(JSON.parse(raw));
                } catch(e) {
                    reject(e);
                }
            });
        }
        return this.loadRemoteData();

    }
    
    componentDidMount() {
        this.getMasterData().then(data => this.setState({data}));
    }

    async loadRemoteData():Promise<IDataItem[]> {
        try {
            console.log('fetching data...');
            let response = await fetch(this.props.apiUrl + '/regions',{method:'GET'});
            if (!response.ok) {
                throw await response.text();
            }
            let rawData = await response.json();
            let data = rawData.map((item:any) => ({
                country:item['Country/Region'],
                region:item['Province/State'],
                confirmed:Number(item['Confirmed']),
                recovered:Number(item['Recovered']),
                deaths:Number(item['Deaths']),
                lat:Number(item['lat']),
                lon:Number(item['lon']),
            }));
            localStorage.setItem('raw',JSON.stringify(data));
            localStorage.setItem('lastSync',new Date().toISOString());
            return data;
        } catch(e) {
            throw e;
        }

    }
    render() {
        return <div className='root'>
            <div className='header'>
                <div className='logo'></div>
                <div className='title'>Health Monitor</div>
                <div className='padder'></div>
            </div>
            <div className='toolbar'>

            </div>
            <div className='data-section'>

            <div className='stats'>
                <div className='stat confirmed'>
                    <div className='metric'>300</div>
                    <div className='title'>confirmed</div>
                </div>
                <div className='stat deaths'>
                    <div className='metric'>300</div>
                    <div className='title'>deaths</div>
                </div>
                <div className='stat recovered'>
                    <div className='metric'>300</div>
                    <div className='title'>recovered</div>
                </div>
            </div>
            <div className='data-list-container'>
                <div className='data-list'>
                    <div className='header'>Global List</div>
                    <ListWidget items={this.state.data} />
                    <div className='footer'>
                        <div className='tip'>Learn how this dashboard can be personalized for you</div>
                        <div className='action'>Learn More</div>
                    </div>
                </div>
            </div>
            <div className='map'>
                <div className='map-widget'>
                    <MapWidget />
                </div>
            </div>
            </div>
        </div>
    }
} 

function renderDashboard(url: string,base:string) {

    ReactDom.render(
        <HealthDashboard apiUrl={url} basePath={base}  />,
        document.getElementById("root")
    );
}
renderDashboard("https://staywoke.lucy.servicedeskhq.com/hook/Covid19","/");