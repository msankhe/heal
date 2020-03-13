import * as React from "react";
import { Map, Marker, TileLayer } from "react-leaflet";
import { divIcon, Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';
import { shortenNumber, averageGeolocation } from '../../util';

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
            selectedItem: {
                screened: 80932,
                country: "China",
                employees: 3172,
                oranges: 62901,
                region: "",
                lat: 33.162820731405446,
                lon: 111.55253833374059,
                id: "China"
            },
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

    render() {

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
                            </div>
                            <div className='filters'>
                                <span className='lbl'>Sort</span>
                                {/* <div onClick={this.setSorting.bind(this, 'confirmed')} className={(this.state.sorting == 'confirmed' ? 'set' : '') + ' switch confirmed'}>Confirmed</div>
                                <div onClick={this.setSorting.bind(this, 'deaths')} className={(this.state.sorting == 'deaths' ? 'set' : '') + ' switch deaths'}>Deaths</div>
                                <div onClick={this.setSorting.bind(this, 'recovered')} className={(this.state.sorting == 'recovered' ? 'set' : '') + ' switch recovered'}>Recovered</div> */}

                            </div>
                        </div>
                        {/* <ListWidget sorting={this.state.sorting} context={context} selectedItem={selectedItem} mode={mode} items={items} onItemSelected={this.onItemSelected.bind(this)} /> */}
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
                        
                        <MapWidget items={this.state.data} selectedItem={null} stat={this.state.mapFilter} onItemSelected={this.onItemSelected.bind(this)} />
                    </div>
                </div>


            </div>

        </>);
    }

}

export default LocalDashboard;