import { safeLoad } from 'js-yaml';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import ReactPlayer from 'react-player';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import './index.scss';
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import {divIcon} from 'leaflet';

const SYNC_INTERVAL_MINUTES = 30; //time in minutes to refresh data

function shortenNumber(i:number):string {
    if (i < 1000) return ''+i;
    if (i < 10000) {
        return (( i / 1000.0).toFixed(1))+'K';
    }
    if (i <1000000) {
        return ( i / 1000).toFixed(0) + 'K';
    }
    return ( i / 1000000).toFixed(0) + 'M';
}
interface IHealthDashboardProps {
    apiUrl:string;
    basePath:string;
}
interface IHealthDashboardState {
    data:IDataItem[];
    selectedItem:IDataItem;
    metadata:IMetadata;
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
interface IMetadata {
    countries:string[];
    lastUpdate:string;
}
interface IMapWidgetProps {
    items:IDataItem[];
    selectedItem:IDataItem;
}
class MapWidget extends React.Component<IMapWidgetProps,{}> {
   
    render() {
        return <div className='gmap' >
<Map center={[45.4, -75.7]} zoom={2} >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        
      />
      {
          this.props.items.map((item,key)=>this.renderMarker(item,key))
      }
    </Map>

        </div>;
    }
    renderMarker(item:IDataItem,key:Number) {
        return <Marker 
        position={[item.lat,item.lon]}
        
        icon={divIcon({className:'micon' + (item === this.props.selectedItem?' selected':''),'html':'<div><div class="inner"></div><div class="outer"></div><div class="txt">'+shortenNumber(item.confirmed)+'</div></div>'})}
        />;
    }
}
interface IListWidgetProps {
    items:IDataItem[];
    selectedItem:IDataItem;
    onItemSelected:(item:IDataItem) => void;
}
class ListWidget extends React.Component<IListWidgetProps,{}> {
    render() {
        return <div className='list-widget'>
            {
                this.props.items.map((item,key) => this.renderItem(item,key))
            }
        </div>;
    }
    selectItem(item:IDataItem) {
        if (this.props.selectedItem == item) {
            this.props.onItemSelected(null);
        } else {
            this.props.onItemSelected(item);
        }
    }
    renderSelectedItem(item:IDataItem,key:number) {
        return <div key={key} className='selected-item' onClick={this.selectItem.bind(this, item)}>
            <div className='row1'>

                <div className='country c'>
                    <div className='label'>Country</div>
                    <div className='value'>{item.country}</div>
                </div>
                <div className='area c'>
                    <div className='label'>Area</div>
                    <div className='value'>{item.region}</div>
                </div>
                <div className='notify c'>
                    <div className='action'>Notify Me</div>
                </div>
            </div>
            <div className='row2'>

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
            </div>
            <div className='chart-row'>

            </div>

        </div>;
    }
    renderItem(item:IDataItem,key:number) {
        if (item === this.props.selectedItem) {
            return this.renderSelectedItem(item,key);            
        }

        return <div key={key} className='item' onClick={this.selectItem.bind(this,item)}>
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
        </div>;
    }
}
class HealthDashboard extends React.Component<IHealthDashboardProps,IHealthDashboardState> {
    constructor(props:IHealthDashboardProps) {
        super(props);
        this.state = {data:[],selectedItem:null,metadata:null};
    }
    filterItem(item:IDataItem) {
        return true;
    }
    filteredData():{confirmed:number,deaths:number,recovered:number,items:IDataItem[]} {
        let data = this.state.data;
        let items = [];
        let confirmed = 0;
        let deaths = 0;
        let recovered = 0;
        for(let i=0;i<data.length;i++) {
            let item = data[i];
            if (this.filterItem(item)) {
                confirmed += item.confirmed;
                deaths += item.deaths;
                recovered += item.recovered;
                items.push(item);
            }
        }
        return {items,confirmed,deaths,recovered};
    }
    getMasterData():Promise<{items:IDataItem[],metadata:IMetadata}> {
        let raw = localStorage.getItem('raw');
        let lastUpdate = localStorage.getItem('lastSync');
        let requiresResync = false;
        if (!lastUpdate || !raw) {
            requiresResync = true;
        } else {
            let dt = new Date(lastUpdate);
            let elapsedMinutes =  (Number(new Date()) - Number(dt))/(1000*60);
            if (elapsedMinutes > SYNC_INTERVAL_MINUTES) {
                requiresResync = true;
            }
        };
        if (!requiresResync) {
            return new Promise((resolve,reject)=>{
                try {
                    let items = JSON.parse(raw);
                    let metadata = this.getMetadata(items);
                    resolve({items,metadata});
                } catch(e) {
                    reject(e);
                }
            });
        }
        return this.loadRemoteData();

    }
    getMetadata(items:IDataItem[]) {
        let countries:any = {};
        let lastUpdate = '';
        for(let i=0;i<items.length;i++) {
            countries[items[i].country] = 1;
            lastUpdate = '';
        }
        return {countries:Object.keys(countries),lastUpdate};
    }

    componentDidMount() {
        this.getMasterData().then(data => this.setState({data:data.items,metadata:data.metadata}));
    }

    async loadRemoteData():Promise<{items:IDataItem[],metadata:IMetadata}> {
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
            let metadata = this.getMetadata(data);
            return {items:data,metadata};
        } catch(e) {
            throw e;
        }

    }
    onItemSelected(item:IDataItem) {
        this.setState({selectedItem:item});
    }
    render() {
        let {items,confirmed,deaths,recovered} = this.filteredData();
        let selectedItem = this.state.selectedItem;
        /* selected item is not in current list - presumably due to filtering */
        if (items.indexOf(selectedItem) < 0) {
            selectedItem = null;
        }
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
                    <div className='metric'>{confirmed}</div>
                    <div className='title'>confirmed</div>
                </div>
                <div className='stat deaths'>
                    <div className='metric'>{deaths}</div>
                    <div className='title'>deaths</div>
                </div>
                <div className='stat recovered'>
                    <div className='metric'>{recovered}</div>
                    <div className='title'>recovered</div>
                </div>
            </div>
            <div className='data-list-container'>
                <div className='data-list'>
                    <div className='header'>Global List</div>
                    <ListWidget selectedItem={selectedItem}  items={items} onItemSelected={this.onItemSelected.bind(this)} />
                    <div className='footer'>
                        <div className='tip'>Learn how this dashboard can be personalized for you</div>
                        <div className='action'>Learn More</div>
                    </div>
                </div>
            </div>
            <div className='map'>
                <div className='map-widget'>
                    <MapWidget items={items} selectedItem={selectedItem} />
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