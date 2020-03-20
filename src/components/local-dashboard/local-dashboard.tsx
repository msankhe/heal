import * as React from 'react';
import { Map, Marker, TileLayer } from "react-leaflet";
import { divIcon, Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';


type IStatType = 'screened' | 'employees' | 'oranges';
type IListFilter = 'starred' | 'all';

interface IEmployeeDetails {
    _id: string,
    id: string,
    name: string,
    location: string,
    source: string,
    countriesvisited: string;
    created: Date

    lat: number;
    long: number;
    temperature: number;
    locationName: string;
    dataSourceName: string;
    dataSourceIcon: string;
    status: string;
    starred: boolean;
    lastScanned: string,
}

interface IScanData {
    temperature: number,
    name: string,
    location: string,
    lastVisitedCountry: string
}

interface ILocalProps {
    apiUrl: string,
    apiKey: string,
    basePath: string
}

interface ILocalState {
    userId: string,
    screened: number,
    employees: number,
    oranges: number,
    lastUpdated: string,
    sorting: IListFilter,
    data: IEmployeeDetails[],
    dialog: 'info' | 'precautions' | 'scann' | '',
    mapFilter: IStatType,
    scannData: IScanData
}

interface IListWidgetProps {
    items: IEmployeeDetails[];
    sorting: IListFilter;
}
interface IListWidgetState {
}

interface IMapWidgetProps {
    items: IEmployeeDetails[]
}


class ListWidget extends React.Component<IListWidgetProps, IListWidgetState> {

    constructor(props: IListWidgetProps) {
        super(props);

    }

    componentDidUpdate(prevProps: IListWidgetProps, prevState: IListWidgetState) { }

    renderItem(item: IEmployeeDetails, key: number) {

        return <div key={key} className='item local-list'>

            <div className='c status'>
                <div className={`label ${item.status} `}></div>
                <div className='value'>{item.status}</div>
            </div>
            <div className=' c'>
                <div className='label'>Location</div>
                <div className='value'>{item.location} </div>
            </div>
            <div className='temperature c'>
                <div className='label'>Temperature</div>
                <div className='value'>{item.temperature} &#8451;</div>
            </div>
            <div className='name c'>
                <div className='label'>Name</div>
                <div className='value'>{item.name}</div>
            </div>
            <div className='last-country c'>
                <div className='label'>Last Country Visited</div>
                <div className='value'>{item.countriesvisited}</div>
            </div>
            <div className='data-source c'>
                <div className='label'>Data Source</div>
                <div className='value'>
                    {item.source}
                    {/* <img src={item.dataSourceIcon} alt={item.dataSourceName} /> */}
                </div>
            </div>
            <div className={`c starred`}>
                <div className={`value starred ${item.starred ? "fill" : ""}  `}>
                </div>
            </div>
        </div>;
    }

    render() {
        let t = this.props.sorting;
        // let items = this.props.items.slice().sort((a, b) => {
        //     return Number(b[t]) - Number(a[t]);
        // });

        let items = this.props.items;

        return <div className='list-widget'>
            {
                items.map((item, key) => this.renderItem(item, key))
            }
        </div>;
    }
}

class MapWidget extends React.Component<IMapWidgetProps, {}> {
    map: LeafletMap;

    componentDidUpdate(prevProps: IMapWidgetProps) {
        // if (this.props.items.length == 0) return;

        // /* if only one point is present - fitBounds() fails. So just pan to that item */
        // if (this.props.items.length == 1) {
        //     let zoom = this.map?.getZoom() || 0;
        //     //if (zoom < 3) zoom = 3;
        //     this.map?.setView([this.props.items[0].lat, this.props.items[0].long], zoom);
        //     return;
        // }

        // let bounds = this.props.items.map(item => [item.lat, item.long]) as LatLngBoundsExpression;
        // this.map.fitBounds(bounds);

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
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {
                    //this.props.items.map((item, key) => this.renderMarker(item, key, size))
                }
            </Map>

        </div>;
    }

    renderMarker(item: IEmployeeDetails, key: number, size: string) {
        //let stat = shortenNumber(item[this.props.stat]);
        //console.log(stat);
        let markerClass = `micon screened selected ${size}`;

        // return <Marker
        //     //onClick={() => this.props.onItemSelected(item)}
        //     position={[item.lat, item.long]}
        //     key={key}
        //     icon={divIcon({ className: markerClass, 'html': '<div><div class="inner"></div><div class="outer"></div><div class="txt"></div></div>' })}
        // />;
    }
}

class LocalDashboard extends React.Component<ILocalProps, ILocalState>  {

    constructor(props: ILocalProps) {
        super(props);

        this.state = {
            userId: "user_01",
            screened: 0,
            employees: 0,
            oranges: 0,
            lastUpdated: null,
            sorting: 'starred',
            data: [],
            dialog: "",
            mapFilter: 'screened',
            scannData: {
                temperature: 0,
                name: null,
                location: null,
                lastVisitedCountry: null
            }
        }
    }

    componentDidMount() {
        this.loadRemoteData();
    }

    async loadRemoteData(): Promise<{ details: IEmployeeDetails[] }> {
        try {
            console.log('fetching data...');
            let response = await fetch(this.props.apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'APIKEY ' + this.props.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw await response.text();
            }
            let rawData = await response.json();
            let lastUpdate = rawData.lastUpdated;
            localStorage.setItem('locallastUpdated', lastUpdate);

            // console.log(rawData);

            // if (rawData.stats) {
            //     this.setState({
            //         screened: rawData.stats.screened,
            //         employees: rawData.stats.employees,
            //         oranges: rawData.stats.oranges
            //     })
            // }

            let details = [];

            if (rawData) {
                details = rawData;
            }

            this.setState({ data: details, lastUpdated: lastUpdate });

            return { details };
        } catch (e) {
            throw e;
        }

    }

    setSorting(type: IListFilter) {
        this.setState({ sorting: type });
    }

    setMapFilter(filter: IStatType) {
        this.setState({ mapFilter: filter });
    }

    renderInfoDialog() {
        return <><div className='dialog-sheet' onClick={() => this.setState({ dialog: '' })} />
            <div className='dialog info'>
                <div className='header'>
                    <div className='first'></div>
                    <div className='title'>
                        Information
                        </div>
                    <div className='last'>

                        <div className='closer' onClick={() => this.setState({ dialog: '' })} />
                    </div>
                </div>
                <div className='body'>
                    <ol className='items'>
                        <li>
                            <div className='text'>WHO has information on how to keep yourself and your family safe. </div>
                            <div className='action-container'>
                                <a className='action' href='https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public' target='_blank'>View</a>
                            </div>
                        </li>
                        <li>
                            <div className='text'>
                                CFR (Case Fatality Rate) is calculated as percentage of fatalities in confirmed cases.
                                 </div>
                            <div className='action-container'>

                            </div>
                        </li>
                        <li>
                            <div className='text'>Data for this dashboard is sourced from several places, most notably, John Hopkins Center for System Science  and Engineering</div>
                            <div className='action-container'>
                                <a className='action' href='https://github.com/CSSEGISandData' target='_blank'>Source</a>
                            </div>
                        </li>
                        <li>
                            <div className='text'>The APIs for this dashboard are powered by Lucy using data culled from the sources mentioned above.</div>
                            <div className='action-container'>
                                <a className='action' href='https://lucyinthesky.io' target='_blank'>Learn More</a>
                            </div>
                        </li>
                        <li>
                            <div className='text'>The code for this dashboard is available on Github.</div>
                            <div className='action-container'>
                                <a className='action' href='https://github.com/lucy-platform/heal' target='_blank'>View on Github</a>
                            </div>
                        </li>
                    </ol>

                </div>
            </div>
        </>;
    }

    renderPrecautions() {
        return <><div className='dialog-sheet' onClick={() => this.setState({ dialog: '' })} />
            <div className='dialog info'>
                <div className='header'>
                    <div className='first'></div>
                    <div className='title'>
                        Precautions To avoid infection
                        </div>
                    <div className='last'>

                        <div className='closer' onClick={() => this.setState({ dialog: '' })} />
                    </div>
                </div>
                <div className='body'>
                    <ol className='items'>
                        <li>
                            <div className='text'>Wash your hands each time you walk in the door </div>
                            <div className='action-container'>
                                <a className='action' href='https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public' target='_blank'>Read more</a>
                            </div>
                        </li>

                    </ol>

                </div>
            </div>
        </>;
    }

    renderScanningForm() {
        return <>
            <div className='dialog-sheet' onClick={() => this.setState({ dialog: '' })} />
            <div className='dialog scann-form'>
                <div className='header'>

                    <div className='title'>
                        New Screening Form
                        </div>
                    <div className='last'>

                        <div className='closer' onClick={() => this.setState({ dialog: '' })} />
                    </div>
                </div>
                <div className='body'>

                    <div className="form-group">
                        <label className="label" >Temperature</label>
                        <input type="number" min={0} step={0.1} name="temperature" className="input" value={this.state.scannData.temperature} placeholder="" />
                    </div>

                    <div className="form-group">
                        <label className="label" >Name <span>Autofill</span> </label>
                        <input type="text" name="name" className="input" value={this.state.scannData.name} placeholder="Example: John Doe" />
                    </div>

                    <div className="form-group">
                        <label className="label" >Location <span>Autofill</span> </label>
                        <input type="text" name="location" className="input" value={this.state.scannData.location} placeholder="Example: Singapore" />
                    </div>

                    <div className="form-group">
                        <label className="label" >Last Country Visited </label>
                        <input type="text" name="lastvisited" className="input" value={this.state.scannData.lastVisitedCountry} placeholder="Example: Kenya" />
                    </div>

                    <div className="form-group buttons">
                        <button type="button" className="submit-button">
                            <span className="icon"></span>
                            SUBMIT
                        </button>
                    </div>

                </div>
            </div>

        </>;
    }

    render() {

        var dialog = <></>;
        if (this.state.dialog == "info") {
            dialog = this.renderInfoDialog();
        }
        else if (this.state.dialog == "precautions") {
            dialog = this.renderPrecautions();
        }
        else if (this.state.dialog == "scann") {
            dialog = this.renderScanningForm();
        }

        return (<>
            <div className='toolbar'>

                <div className="toolbar-button" onClick={() => this.setState({ dialog: 'precautions' })} >
                    Precautions <span className="arrow"></span>
                </div>

                <div className="toolbar-button" onClick={() => this.setState({ dialog: '' })} >
                    All <span className="arrow"></span>
                </div>

            </div>

            <div className='data-section'>

                <div className='stats stat-local'>
                    <div className='stats-header'>
                        <div className='dt'>

                        </div>
                    </div>
                    <div className='stat screened'>
                        <div className='metric'>{this.state.screened}</div>
                        <div className='title'>screened</div>
                    </div>
                    <div className='stat employees'>
                        <div className='metric'>{this.state.employees}</div>
                        <div className='title'>employees</div>
                    </div>
                    <div className='stat oranges'>
                        <div className='metric'>{this.state.oranges}</div>
                        <div className='title'>oranges</div>
                    </div>
                </div>


                <div className='data-list-container local-list'>
                    <div className='data-list'>
                        <div className='header'>
                            <div className='title local-list'>
                                <span className="arrow"></span>
                                Last scanned
                            </div>
                            <div className='filters'>
                                <div onClick={this.setSorting.bind(this, 'starred')} className={(this.state.sorting == 'starred' ? 'set' : '') + ' switch starred'}><span className="icon star"></span>starred</div>
                                <div onClick={this.setSorting.bind(this, 'all')} className={(this.state.sorting == 'all' ? 'set' : '') + ' switch all'}>All <span className="icon arrow"></span> </div>

                            </div>
                        </div>
                        <ListWidget sorting={this.state.sorting} items={this.state.data} />
                        <div className='footer'>
                            <div className='tip'>Learn how this dashboard could be personalised to you</div>
                            <div className='action' onClick={() => this.setState({ dialog: 'info' })}>Info</div>
                        </div>
                    </div>
                </div>

                <div className='map local-map'>
                    <div className='map-widget'>
                        <div className='filters'>
                            <div onClick={this.setMapFilter.bind(this, 'screened')} className={(this.state.mapFilter == 'screened' ? 'set' : '') + ' switch screened'}><span className="icon"></span> screened</div>
                            <div onClick={this.setMapFilter.bind(this, 'employees')} className={(this.state.mapFilter == 'employees' ? 'set' : '') + ' switch employees'}><span className="icon"></span>employees</div>
                            <div onClick={this.setMapFilter.bind(this, 'oranges')} className={(this.state.mapFilter == 'oranges' ? 'set' : '') + ' switch oranges'}><span className="icon"></span>oranges</div>
                        </div>

                        <MapWidget items={this.state.data} />
                    </div>
                </div>


            </div>

            <div className={`bottom-bar `} onClick={() => this.setState({ dialog: "scann" })}>

            </div>

            {dialog}

        </>);
    }
}

export default LocalDashboard;