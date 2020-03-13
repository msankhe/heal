import * as React from "react";
// import './global-dashboard.scss';
import './global-mobile.scss';
import { Map, Marker, TileLayer } from "react-leaflet";
import { divIcon, Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';
import * as Recharts from 'recharts';
import { shortenNumber, averageGeolocation } from '../../util';

const SYNC_INTERVAL_MINUTES = 30; //time in minutes to refresh data

const POPULATION_SYNC_INTERVAL_MINUTES = 60 * 24; //population data can be synced once a day

type IFilterMode = 'country' | 'global';
type IStatType = 'confirmed' | 'deaths' | 'recovered';

interface IDataItem {
    country: string;
    region: string;
    confirmed: number;
    deaths: number;
    recovered: number;
    lat: number;
    lon: number;
    id: string;
}
interface IMetadata {
    countries: string[];
    lastUpdate: string;
}


interface ITrendPoint {
    timestamp: Date;
    value: number;
}
interface ITrendData {
    confirmed: ITrendPoint[];
    recovered: ITrendPoint[];
    deaths: ITrendPoint[];
}

interface IPopulationInfo {
    country: string;
    population: number;
}


interface IHealthDashboardProps {
    apiUrl: string;
    basePath: string;
}
interface IHealthDashboardState {
    data: IDataItem[];
    selectedItem: IDataItem;
    metadata: IMetadata;
    countryFilter: string;
    mapFilter: IStatType;
    sorting: IStatType;
    dialog: 'info' | '';
}

interface IMapWidgetProps {
    items: IDataItem[];
    selectedItem: IDataItem;
    onItemSelected: (item: IDataItem) => void;
    stat: IStatType;
}

interface IListWidgetProps {
    items: IDataItem[];
    selectedItem: IDataItem;
    onItemSelected: (item: IDataItem) => void;
    mode: IFilterMode;
    context: IAppContext;
    sorting: IStatType;
}
interface IListWidgetState {
    trendData: ITrendData;
    trendDataError: any;
    population: number;
}

interface IAppContext {
    getTrends: (country: string, region: string) => Promise<{ trends: ITrendData, population: number }>;
}

function cfr(item: IDataItem) {
    if (item.confirmed == 0) return '0%';
    let r = 100 * item.deaths / item.confirmed;
    return r.toFixed(1) + '%';
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
            this.map?.setView([this.props.selectedItem.lat, this.props.selectedItem.lon], zoom);
            return;
        }

        /* if only one point is present - fitBounds() fails. So just pan to that item */
        if (this.props.items.length == 1) {
            let zoom = this.map?.getZoom() || 0;
            if (zoom < 3) zoom = 3;
            this.map?.setView([this.props.items[0].lat, this.props.items[0].lon], zoom);
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
let Context = React.createContext<IAppContext>({
    getTrends: (c: string, r: string) => { throw 'not implemented'; }
});


class AxisTick extends React.PureComponent<{ payload?: any }, {}>{
    render() {
        let payload = this.props.payload;
        return <text>{'XXX' + payload}</text>;
    }

}
class ListWidget extends React.Component<IListWidgetProps, IListWidgetState> {
    selectedEl: HTMLElement;
    containerEl: HTMLElement;
    constructor(props: IListWidgetProps) {
        super(props);
        this.state = { trendData: null, trendDataError: null, population: 0 };
    }

    componentDidUpdate(prevProps: IListWidgetProps, prevState: IListWidgetState) {
        let prevItem = prevProps.selectedItem;
        let item = this.props.selectedItem;
        if (item == null) {
            return;
        }
        if (prevItem != null && prevItem.id === item.id) {
            return;
        }
        console.log('Updating trends');
        this.props.context.getTrends(item.country, item.region)
            .then(({ trends, population }) => this.setState({ trendData: trends, population, trendDataError: null }, () => {
                if (this.selectedEl && this.containerEl) {
                    this.selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }))
            .catch(e => this.setState({ trendDataError: e, trendData: null }));
    }
    render() {
        let t = this.props.sorting;
        let items = this.props.items.slice().sort((a, b) => {
            return Number(b[t]) - Number(a[t]);
        });
        return <div ref={(el) => this.containerEl = el} className='list-widget'>
            {
                items.map((item, key) => this.renderItem(item, key))
            }
        </div>;
    }
    selectItem(item: IDataItem) {
        if (this.props.selectedItem?.id == item.id) {
            this.props.onItemSelected(null);
        } else {
            this.props.onItemSelected(item);
        }
    }
    renderSelectedItem(item: IDataItem, key: number) {
        return <div key={key}
            ref={(el) => this.selectedEl = el}
            className='selected-item' onClick={this.selectItem.bind(this, item)}>
            <div className='row1'>
                {
                    (this.props.mode != 'global' && !!item.region) ? null :
                        <div className='country c'>
                            <div className='label'>Country</div>
                            <div className='value'>{item.country}</div>
                        </div>
                }
                {
                    (this.props.mode == 'global' || !item.region) ? null :
                        <div className='area c'>
                            <div className='label'>Area</div>
                            <div className='value'>{item.region}</div>
                        </div>
                }
                {
                    this.state.population ? <>
                        <div className='population c'>
                            <div className='label'>Population</div>
                            <div className='value'>{shortenNumber(this.state.population)}</div>
                        </div>


                    </>
                        : null

                }
                <div className='cfr c'>
                    <div className='label' title='Case Fatality Rate'>CFR</div>
                    <div className='value'>{cfr(item)}</div>
                </div>
                {/* <div className='notify c'>
                    <div className='action'>Notify Me</div>
                </div> */}
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
            <div className='chart-row x'>
                {
                    this.state.trendData == null ? <div className='loading-data'>Loading</div> : this.renderTrends()
                }

            </div>
        </div>;
    }
    renderTrends() {
        if (this.state.trendDataError != null) {
            return <div className='loading-data'>An error occurred while loading data. Please try later</div>;
        }

        let data = this.state.trendData;
        if (data == null || data.confirmed.length == 0) {
            return <div className='loading-data'>No data available</div>;
        }
        let zippedData: { confirmed: number, recovered: number, deaths: number, timestamp: Date }[] = [];

        for (let i = 0; i < data.confirmed.length; i++) {
            zippedData.push({
                confirmed: data.confirmed[i]?.value,
                recovered: data.recovered[i]?.value,
                deaths: data.deaths[i]?.value,
                timestamp: data.confirmed[i]?.timestamp,
            });
        }
        return <Recharts.ResponsiveContainer height='100%' width='100%'>
            <Recharts.AreaChart data={zippedData}>
                <Recharts.Tooltip content={(o: any) => {
                    if (o.active) {
                        let obj = o.payload[0].payload;
                        return <div className='tt'>
                            <div className='date'>{new Date(obj.timestamp).toLocaleDateString()}</div>
                            <div className='c'>{'Confirmed: ' + obj.confirmed}</div>
                            <div className='c'>{'Recovered: ' + obj.recovered}</div>
                            <div className='c'>{'Deaths: ' + obj.deaths}</div>
                        </div>
                    } else {
                        return null;
                    }
                }} />
                <Recharts.Area type='monotone' activeDot={{ r: 1 }} dataKey='confirmed' fillOpacity={0.7} fill='#06F' />
                <Recharts.Area type='monotone' activeDot={{ r: 1 }} dataKey='recovered' fillOpacity={0.7} fill='green' />
                <Recharts.Area type='monotone' activeDot={{ r: 1 }} dataKey='deaths' fillOpacity={0.7} fill='red' />

            </Recharts.AreaChart>
        </Recharts.ResponsiveContainer>
    }
    renderItem(item: IDataItem, key: number) {
        if (item.id === this.props.selectedItem?.id) {
            return this.renderSelectedItem(item, key);
        }

        return <div key={key} className='item' onClick={this.selectItem.bind(this, item)}>
            {(this.props.mode != 'global' && !!item.region) ? null :
                <div className='country c'>
                    <div className='label'>Country</div>
                    <div className='value'>{item.country}</div>
                </div>
            }
            {
                (this.props.mode == 'global' || !item.region) ? null :
                    <div className='area c'>
                        <div className='label'>Area</div>
                        <div className='value'>{item.region}</div>
                    </div>}
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

        </div>;
    }
}
class HealthDashboard extends React.Component<IHealthDashboardProps, IHealthDashboardState> implements IAppContext {
    constructor(props: IHealthDashboardProps) {
        super(props);
        this.state = {
            data: [],
            selectedItem: null,
            metadata: null,
            countryFilter: '',
            mapFilter: 'confirmed',
            sorting: 'confirmed',
            dialog: '',
        };
    }
    filterItem(item: IDataItem) {
        if (this.state.countryFilter == '') return item;
        return (item.country === this.state.countryFilter);
        return true;
    }
    filteredData(): { confirmed: number, deaths: number, recovered: number, items: IDataItem[] } {
        let data = this.state.data;
        let items = [];
        let confirmed = 0;
        let deaths = 0;
        let recovered = 0;
        let countryMap: { [key: string]: IDataItem } = {};
        let countryList: IDataItem[] = [];
        let countryCoords: { [key: string]: { lat: number, lon: number }[] } = {};
        let aggregateCountries = !this.state.countryFilter;

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (this.filterItem(item)) {
                confirmed += item.confirmed;
                deaths += item.deaths;
                recovered += item.recovered;
                items.push(item);

                if (aggregateCountries) {

                    if (!countryMap[item.country]) {
                        countryMap[item.country] = {
                            confirmed: 0,
                            country: item.country,
                            deaths: 0,
                            recovered: 0,
                            region: '',
                            lat: 0,
                            lon: 0,
                            id: item.country,
                        };
                        countryList.push(countryMap[item.country]);
                    }
                    if (!countryCoords[item.country]) {
                        countryCoords[item.country] = [];
                    }
                    countryMap[item.country].confirmed += item.confirmed;
                    countryMap[item.country].recovered += item.recovered;
                    countryMap[item.country].deaths += item.deaths;

                    countryCoords[item.country].push({ lat: item.lat, lon: item.lon });
                }
            }
        }
        if (aggregateCountries) {
            items = countryList.map(item => {
                let newCoords = averageGeolocation(countryCoords[item.country]);
                item.lat = newCoords.lat;
                item.lon = newCoords.lon;
                return item;
            });
        }
        return { items, confirmed, deaths, recovered };
    }
    composeId(country: string, region: string) {
        let id = country;
        if (!!region) {
            id += '/' + region;
        }
        return id;
    }
    async getTrends(country: string, region: string): Promise<{ trends: ITrendData, population: number }> {
        let trends = await this.getTrendData(country, region);
        let population = 0;

        /* only support population at the country level currently */
        if (!region) {

            let populationData = await this.getPopulationData();
            let populationItems = populationData.filter(_ => _.country == country);
            if (populationItems?.length) {
                population = populationItems[0].population;
            }
        }

        return { trends, population };
    }
    getTrendData(country: string, region: string): Promise<ITrendData> {
        let requiresResync = false;
        let id = this.composeId(country, region);
        let trendData = localStorage.getItem('trends/' + id);
        let lastSync = localStorage.getItem('trends/sync/' + id);
        if (!lastSync || !trendData) {
            requiresResync = true;
        } else {
            let dt = new Date(lastSync);
            let elapsedMinutes = (Number(new Date()) - Number(dt)) / (1000 * 60);
            if (elapsedMinutes > SYNC_INTERVAL_MINUTES) {
                requiresResync = true;
            }
        }
        if (!requiresResync) {
            return new Promise((resolve, reject) => {
                try {
                    let items = JSON.parse(trendData);
                    resolve(items);
                } catch (e) {
                    reject(e);
                }
            });
        }

        return this.loadRemoteTrends(country, region);
    }
    async loadRemoteTrends(country: string, region: string): Promise<ITrendData> {
        try {
            let id = this.composeId(country, region);
            console.log('fetching trend data', id);
            let payload = { country, region };
            let response = await fetch(this.props.apiUrl + '/trends', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }

            });
            if (!response.ok) {
                throw await response.text();
            }
            let rawData = (await response.json()).trends;
            let mapData = (x: any) => {
                let trendItem: ITrendPoint = { timestamp: x.Time, value: Number(x.Value) };
                return trendItem;

            };
            let confirmed = rawData.confirmed.map(mapData);
            let recovered = rawData.recovered.map(mapData);
            let deaths = rawData.deaths.map(mapData);

            let trendData = { confirmed, recovered, deaths };
            localStorage.setItem('trends/' + id, JSON.stringify(trendData));
            localStorage.setItem('trends/sync/' + id, new Date().toISOString());
            return trendData;

        } catch (e) {
            throw e;
        }

    }
    getPopulationData(): Promise<IPopulationInfo[]> {
        let raw = localStorage.getItem('population');
        let lastUpdate = localStorage.getItem('population/lastSync');
        let requiresResync = false;
        if (!lastUpdate || !raw) {
            requiresResync = true;
        } else {
            let dt = new Date(lastUpdate);
            let elapsedMinutes = (Number(new Date()) - Number(dt)) / (1000 * 60);
            if (elapsedMinutes > POPULATION_SYNC_INTERVAL_MINUTES) {
                requiresResync = true;
            }
        };
        if (!requiresResync) {
            return new Promise((resolve, reject) => {
                try {
                    let items = JSON.parse(raw);
                    resolve(items);
                } catch (e) {
                    reject(e);
                }
            });
        }
        return this.loadRemotePopulationData();
    }
    async loadRemotePopulationData(): Promise<IPopulationInfo[]> {
        try {
            console.log('fetching population data...');
            let response = await fetch(this.props.apiUrl + '/population', { method: 'GET' });
            if (!response.ok) {
                throw await response.text();
            }
            let rawData = (await response.json()).population;
            let data = rawData.map((item: any) => ({
                country: item.country,
                population: Number(item.population)
            }));


            localStorage.setItem('population', JSON.stringify(data));
            localStorage.setItem('population/lastSync', new Date().toISOString());
            return data;
        } catch (e) {
            throw e;
        }
    }
    getMasterData(): Promise<{ items: IDataItem[], metadata: IMetadata }> {
        let raw = localStorage.getItem('raw');
        let lastUpdate = localStorage.getItem('lastSync');
        let requiresResync = false;
        if (!lastUpdate || !raw) {
            requiresResync = true;
        } else {
            let dt = new Date(lastUpdate);
            let elapsedMinutes = (Number(new Date()) - Number(dt)) / (1000 * 60);
            if (elapsedMinutes > SYNC_INTERVAL_MINUTES) {
                requiresResync = true;
            }
        };
        if (!requiresResync) {
            return new Promise((resolve, reject) => {
                try {
                    let items = JSON.parse(raw);
                    let metadata = this.getMetadata(items);
                    metadata.lastUpdate = localStorage.getItem('lastUpdated') || '';
                    resolve({ items, metadata });
                } catch (e) {
                    reject(e);
                }
            });
        }

        return this.loadRemoteData();

    }
    getMetadata(items: IDataItem[]) {
        let countries: any = {};
        let lastUpdate = '';
        for (let i = 0; i < items.length; i++) {
            countries[items[i].country] = 1;
            lastUpdate = '';
        }
        let countryList = Object.keys(countries).sort();
        return { countries: countryList, lastUpdate };
    }

    componentDidMount() {
        this.getMasterData().then(data => this.setState({ data: data.items, metadata: data.metadata }));
    }

    async loadRemoteData(): Promise<{ items: IDataItem[], metadata: IMetadata }> {
        try {
            console.log('fetching data...');
            let response = await fetch(this.props.apiUrl + '/regions', { method: 'GET' });
            if (!response.ok) {
                throw await response.text();
            }
            let rawData = await response.json();
            let lastUpdate = rawData.updated;

            let data = rawData.regions.map((item: any) => ({
                country: item['Country/Region'],
                region: item['Province/State'],
                confirmed: Number(item['Confirmed']),
                recovered: Number(item['Recovered']),
                deaths: Number(item['Deaths']),
                lat: Number(item['lat']),
                lon: Number(item['lon']),
                id: item['Country/Region'] + '/' + item['Province/State'],
            }));
            localStorage.setItem('raw', JSON.stringify(data));
            localStorage.setItem('lastSync', new Date().toISOString());
            localStorage.setItem('lastUpdated', lastUpdate);
            let metadata = this.getMetadata(data);
            /* we now get this separtely */
            metadata.lastUpdate = lastUpdate;

            return { items: data, metadata };
        } catch (e) {
            throw e;
        }

    }
    onItemSelected(item: IDataItem) {
        this.setState({ selectedItem: item });

    }
    setMapFilter(filter: IStatType) {
        this.setState({ mapFilter: filter });
    }
    setSorting(type: IStatType) {
        this.setState({ sorting: type });
    }
    setCountryFilter(country: string) {
        this.setState({ countryFilter: country, selectedItem: null });
    }
    render() {
        return this.renderWithContext(this);
    }
    renderWithContext(context: IAppContext) {
        let { items, confirmed, deaths, recovered } = this.filteredData();
        let selectedItem = this.state.selectedItem;
        let countries = this.state.metadata?.countries || [];
        let mode: IFilterMode = this.state.countryFilter ? 'country' : 'global';

        return (<>
            <div className='toolbar'>
                <div className='countries ddl'>
                    <div className='txt'>{this.state.countryFilter || 'All Countries'}</div>
                    <select value={this.state.countryFilter} onChange={(e) => {
                        this.setCountryFilter(e.target.value);
                    }}>
                        <option key={-1} value={''}>All Countries</option>
                        {
                            countries.map((c, i) => {
                                return <option key={i} value={c}>{c}</option>
                            })
                        }
                    </select>
                </div>
            </div>
            <div className='data-section'>

                <div className='stats'>
                    <div className='stats-header'>
                        <div className='dt'>
                            {
                                this.state.metadata?.lastUpdate ? <>
                                    <div className='lbl'>Last Updated</div>
                                    <div className='value'>{new Date(this.state.metadata.lastUpdate).toLocaleString()}</div>
                                </> : null
                            }
                        </div>
                    </div>
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
                        <div className='header'>
                            <div className='title'>{
                                mode == 'global' ? 'Countries' : <><div className='goback' onClick={() => this.setState({ countryFilter: '' })} />
                                    {this.state.countryFilter}
                                </>}
                            </div>
                            <div className='filters'>
                                <span className='lbl'>Sort</span>
                                <div onClick={this.setSorting.bind(this, 'confirmed')} className={(this.state.sorting == 'confirmed' ? 'set' : '') + ' switch confirmed'}>Confirmed</div>
                                <div onClick={this.setSorting.bind(this, 'deaths')} className={(this.state.sorting == 'deaths' ? 'set' : '') + ' switch deaths'}>Deaths</div>
                                <div onClick={this.setSorting.bind(this, 'recovered')} className={(this.state.sorting == 'recovered' ? 'set' : '') + ' switch recovered'}>Recovered</div>

                            </div>
                        </div>
                        <ListWidget sorting={this.state.sorting} context={context} selectedItem={selectedItem} mode={mode} items={items} onItemSelected={this.onItemSelected.bind(this)} />
                        <div className='footer'>
                            <div className='tip'>Learn more about this dashboard</div>
                            <div className='action' onClick={() => this.setState({ dialog: 'info' })}>Info</div>
                        </div>
                    </div>
                </div>
                <div className='map'>
                    <div className='map-widget'>
                        <div className='filters'>
                            <div onClick={this.setMapFilter.bind(this, 'confirmed')} className={(this.state.mapFilter == 'confirmed' ? 'set' : '') + ' switch confirmed'}>Confirmed</div>
                            <div onClick={this.setMapFilter.bind(this, 'deaths')} className={(this.state.mapFilter == 'deaths' ? 'set' : '') + ' switch deaths'}>Deaths</div>
                            <div onClick={this.setMapFilter.bind(this, 'recovered')} className={(this.state.mapFilter == 'recovered' ? 'set' : '') + ' switch recovered'}>Recovered</div>
                        </div>
                        <MapWidget stat={this.state.mapFilter} items={items} selectedItem={selectedItem} onItemSelected={this.onItemSelected.bind(this)} />
                    </div>
                </div>

            </div>
            {
                (this.state.dialog == 'info') ?
                    this.renderInfoDialog() : null
            }
            }
        </>
        )
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
}

export default HealthDashboard;
