import * as React from "react";
import { Map, Marker, TileLayer } from "react-leaflet";
import { divIcon, Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';
import { shortenNumber, averageGeolocation } from '../../util';
import * as Recharts from 'recharts';

type IStatType = 'screened' | 'employees' | 'oranges';

interface IMetadata {
    countries: string[];
    lastUpdate: string;
}

interface ILocalProps {
    //stat: string
}

interface ILocalState {
    data: IDataItem[];
    selectedItem: IDataItem;
    metadata: IMetadata;
    countryFilter: string;
    mapFilter: IStatType;
    sorting: IStatType;
    dialog: 'info' | '';
}

interface IDataItem {
    country: string;
    region: string;
    screened: number;
    employees: number;
    oranges: number;
    lat: number;
    lon: number;
    id: string;
}

interface IMapWidgetProps {
    items: IDataItem[];
    selectedItem: IDataItem;
    onItemSelected: (item: IDataItem) => void;
    stat: IStatType;
}

interface IAppContext {}

interface ITrendPoint {
    timestamp: Date;
    value: number;
}
interface ITrendData {
    screened:ITrendPoint[];
    employees:ITrendPoint[];
    oranges:ITrendPoint[];
}

interface IListWidgetProps {
    items:IDataItem[];
    selectedItem:IDataItem;
    onItemSelected:(item:IDataItem)=>void;
    //mode:IFilterMode;
    context:IAppContext;
    sorting:IStatType;
}
interface IListWidgetState {
    trendData:ITrendData;
    trendDataError:any;
    population:number;
}


class ListWidget extends React.Component<IListWidgetProps,IListWidgetState> {
    selectedEl:HTMLElement;
    containerEl:HTMLElement;
    constructor(props:IListWidgetProps) {
        super(props);
        this.state = {trendData:null,trendDataError:null,population:0};
    }

    componentDidUpdate(prevProps:IListWidgetProps,prevState:IListWidgetState) {
        let prevItem = prevProps.selectedItem;
        let item = this.props.selectedItem;
        if (item == null) {
            return;
        }
        if (prevItem != null && prevItem.id === item.id) {
            return;
        }
        console.log('Updating trends');
        // this.props.context.getTrends(item.country,item.region)
        // .then(({trends,population}) => this.setState({trendData:trends,population,trendDataError:null},()=>{
        //     if (this.selectedEl && this.containerEl) {
        //         this.selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        //     }
        // }))
        // .catch(e => this.setState({trendDataError:e,trendData:null}));
    }
    render() {
        let t = this.props.sorting;
        let items = this.props.items.slice().sort((a,b) => {
            return Number(b[t]) - Number(a[t]);
        });
        return <div ref={(el)=>this.containerEl=el}  className='list-widget'>
            {
                items.map((item,key) => this.renderItem(item,key))
            }
        </div>;
    }
    selectItem(item:IDataItem) {
        if (this.props.selectedItem?.id == item.id) {
            this.props.onItemSelected(null);
        } else {
            this.props.onItemSelected(item);
        }
    }
    renderSelectedItem(item:IDataItem,key:number) {
        return <div key={key} 
        ref={(el)=>this.selectedEl = el}
        className='selected-item' onClick={this.selectItem.bind(this, item)}>
            <div className='row1'>
                {
                    //(this.props.mode!='global' && !!item.region)?null:
                    <div className='country c'>
                    <div className='label'>Country</div>
                    <div className='value'>{item.country}</div>
                </div>
                }
                {
                    //(this.props.mode=='global' || !item.region)?null:
                    <div className='area c'>
                        <div className='label'>Area</div>
                        <div className='value'>{item.region}</div>
                    </div>
                }
                {
                    this.state.population ?<>
                        <div className='population c'>
                            <div className='label'>Population</div>
                            <div className='value'>{shortenNumber(this.state.population)}</div>
                        </div>
                       
                       
                        </>
                        : null

                }
                 <div className='cfr c'>
                            <div className='label' title='Case Fatality Rate'>CFR</div>
                            <div className='value'>{/*cfr(item)*/}</div>
                        </div>
                {/* <div className='notify c'>
                    <div className='action'>Notify Me</div>
                </div> */}
            </div>
            <div className='row2'>

                <div className='confirmed c'>
                    <div className='label'>screened</div>
                    <div className='value'>12</div>
                </div>
                <div className='deaths c'>
                    <div className='label'>Deaths</div>
                    <div className='value'>22</div>
                </div>
                <div className='recovered c'>
                    <div className='label'>Recovered</div>
                    <div className='value'>22</div>
                </div>
            </div>
            <div className='chart-row x'>
                {
                    this.state.trendData==null?<div className='loading-data'>Loading</div>:this.renderTrends()
                }
              
            </div>
        </div>;
    }
    renderTrends() {
        if (this.state.trendDataError != null) {
            return <div className='loading-data'>An error occurred while loading data. Please try later</div>;
        }

        let data = this.state.trendData;
        if (data==null || data.screened.length==0) {
            return <div className='loading-data'>No data available</div>;
        }
        let zippedData:{screened:number,employees:number,oranges:number,timestamp:Date}[] = [];

        for(let i=0;i<data.screened.length;i++) {
            zippedData.push({
                screened:data.screened[i]?.value,
                employees:data.employees[i]?.value,
                oranges:data.oranges[i]?.value,
                timestamp:data.screened[i]?.timestamp,
            });
        }
        return <Recharts.ResponsiveContainer height='100%' width='100%'>
        <Recharts.AreaChart data={zippedData}>
            <Recharts.Tooltip content={(o:any)=>{
                if (o.active) {
                    let obj = o.payload[0].payload;
                    return <div className='tt'>
                        <div className='date'>{new Date(obj.timestamp).toLocaleDateString()}</div>
                        <div className='c'>{'Screened: ' + obj.screened}</div>
                        <div className='c'>{'Employees: ' + obj.employees}</div>
                        <div className='c'>{'Oranges: ' + obj.oranges}</div>
                    </div>
                } else {
                    return null;
                }
            }} />
            <Recharts.Area type='monotone' activeDot={{r:1}} dataKey='screened' fillOpacity={0.7} fill='#06F' />
            <Recharts.Area type='monotone' activeDot={{r:1}} dataKey='employees' fillOpacity={0.7} fill='green' />
            <Recharts.Area type='monotone' activeDot={{r:1}} dataKey='oranges' fillOpacity={0.7} fill='red' />

        </Recharts.AreaChart>
        </Recharts.ResponsiveContainer>
    }
    renderItem(item:IDataItem,key:number) {
        if (item.id === this.props.selectedItem?.id) {
            return this.renderSelectedItem(item,key);            
        }

        return <div key={key} className='item' onClick={this.selectItem.bind(this,item)}>
           {  
        //    (this.props.mode!='global' && !!item.region)?null:
        //    <div className='country c'>
        //         <div className='label'>Country</div>
        //         <div className='value'>{item.country}</div>
        //     </div>
            }
            {
                //  (this.props.mode=='global' || !item.region)?null:
                <div className='area c'>
                <div className='label'>Area</div>
                <div className='value'>{item.region}</div>
            </div>}
            <div className='confirmed c'>
                <div className='label'>Confirmed</div>
                <div className='value'>1</div>
            </div>
            <div className='deaths c'>
                <div className='label'>Deaths</div>
                <div className='value'>1</div>
            </div>
            <div className='recovered c'>
                <div className='label'>Recovered</div>
                <div className='value'>1</div>
            </div>
           
        </div>;
    }
}

class MapWidget extends React.Component<IMapWidgetProps, {}> {
    map: LeafletMap;
    componentDidMount() {

    }

    componentDidUpdate(prevProps: IMapWidgetProps) {
        if (this.props.items.length == 0) return;
        if (this.props.selectedItem != null) {
            let zoom = this.map?.getZoom() || 0;
            if (zoom < 3) zoom = 3;
            this.map?.setView([this.props.selectedItem.lat, this.props.selectedItem.lon],zoom);
            return;
        }

        /* if only one point is present - fitBounds() fails. So just pan to that item */
        if (this.props.items.length == 1) {
            let zoom = this.map?.getZoom() || 0;
            if (zoom < 3) zoom = 3;
            this.map?.setView([this.props.items[0].lat, this.props.items[0].lon],zoom);
            return;
        }

        let bounds = this.props.items.map(item => [item.lat, item.lon]) as LatLngBoundsExpression;
        this.map.fitBounds(bounds);

    }

    render() {
        let size = '';
        let zoom = this.map?.getZoom();

        if (zoom < 3) {
            size = 'tiny';
        }

        return <div className='gmap' >
            <Map center={[45.4, -75.7]} zoom={2}
                ref={(el) => {
                    if (!!el) {
                        this.map = el.leafletElement;
                    }
                }}

            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />
                {
                    this.props.items.map((item, key) => this.renderMarker(item, key, size))
                }
            </Map>

        </div>;
    }
    renderMarker(item: IDataItem, key: number, size: string) {
        let stat = shortenNumber(item[this.props.stat]);
        console.log(stat);
        let markerClass = `micon ${this.props.stat} ${size}`;
        if (item.id === this.props.selectedItem?.id) {
            markerClass += ' selected';
        }

        return <Marker
            onClick={() => this.props.onItemSelected(item)}
            position={[item.lat, item.lon]}
            key={item.id}
            icon={divIcon({ className: markerClass, 'html': '<div><div class="inner"></div><div class="outer"></div><div class="txt">' + stat + '</div></div>' })}
        />;
    }
}


class LocalDashboard extends React.Component<ILocalProps, ILocalState>  {

    constructor(props: ILocalProps) {
        super(props);

        this.state = {
            data: [
                {
                    screened: 80932,
                    country: "China",
                    employees: 3172,
                    oranges: 62901,
                    region: "",
                    lat: 33.162820731405446,
                    lon: 111.55253833374059,
                    id: "China"
                }
            ],
            selectedItem: null,
            metadata: null,
            countryFilter: '',
            mapFilter: 'screened',
            sorting: 'screened',
            dialog: '',
        };
    }

    setMapFilter(filter: IStatType) {
        this.setState({ mapFilter: filter });
    }

    onItemSelected(item:IDataItem) {
        this.setState({selectedItem:item});
       
    }

    setSorting(type:IStatType) {
        this.setState({sorting:type});
    }

    render() {

        //let {items,screened,employees,oranges} = this.filteredData();
        let selectedItem = this.state.selectedItem;
        //let countries = this.state.metadata?.countries || [];
        //let mode:IFilterMode = this.state.countryFilter?'country':'global';

        return (<>

            <div className='toolbar'></div>

            <div className='data-section'>

                <div className='stats stat-local'>
                    <div className='stats-header'>
                        <div className='dt'>

                        </div>
                    </div>
                    <div className='stat screened'>
                        <div className='metric'>20</div>
                        <div className='title'>screened</div>
                    </div>
                    <div className='stat employees'>
                        <div className='metric'>2</div>
                        <div className='title'>employees</div>
                    </div>
                    <div className='stat oranges'>
                        <div className='metric'>2</div>
                        <div className='title'>oranges</div>
                    </div>
                </div>


                <div className='data-list-container local-list'>
                    <div className='data-list'>
                        <div className='header'>
                            <div className='title'>
                                {
                                    // mode == 'global' ? 'Countries' : <><div className='goback' onClick={() => this.setState({ countryFilter: '' })} />
                                    //     {this.state.countryFilter}
                                    // </>
                                }
                                last scanned
                            </div>
                            <div className='filters'>
                                <span className='lbl'>Sort</span>
                                <div onClick={this.setSorting.bind(this, 'screened')} className={(this.state.sorting == 'screened' ? 'set' : '') + ' switch screened'}>starred</div>
                                <div onClick={this.setSorting.bind(this, 'employees')} className={(this.state.sorting == 'employees' ? 'set' : '') + ' switch employees'}>All</div>

                            </div>
                        </div>
                        <ListWidget sorting={this.state.sorting} context={null} selectedItem={selectedItem} items={this.state.data} onItemSelected={this.onItemSelected.bind(this)} />
                        <div className='footer'>
                            <div className='tip'>Learn more about this dashboard</div>
                            <div className='action' onClick={() => this.setState({ dialog: 'info' })}>Info</div>
                        </div>
                    </div>
                </div>
                <div className='map local-map'>
                    <div className='map-widget'>
                        <div className='filters'>
                            <div onClick={this.setMapFilter.bind(this, 'screened')} className={(this.state.mapFilter == 'screened' ? 'set' : '') + ' switch screened'}>screened</div>
                            <div onClick={this.setMapFilter.bind(this, 'employees')} className={(this.state.mapFilter == 'employees' ? 'set' : '') + ' switch employees'}>employees</div>
                            <div onClick={this.setMapFilter.bind(this, 'oranges')} className={(this.state.mapFilter == 'oranges' ? 'set' : '') + ' switch oranges'}>oranges</div>
                        </div>

                        <MapWidget items={this.state.data} selectedItem={selectedItem} stat={this.state.mapFilter} onItemSelected={this.onItemSelected.bind(this)} />
                    </div>
                </div>


            </div>

        </>);
    }

}

export default LocalDashboard;