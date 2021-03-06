import * as React from 'react';
import { Map, Marker, TileLayer } from "react-leaflet";
import { divIcon, Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';

declare const window: any;

type IStatType = 'screened' | 'employees' | 'oranges';
type IListFilter = 'starred' | 'all';

interface IEmployeeDetails {
    _id: string,
    id: string,
    name: string,
    location: string,
    source: string,
    countriesvisited: string,
    created: Date,
    temperature: string,
    status: string,
    starred: boolean,
    tempunit: string,

    lat: number,
    long: number,
    locationName: string,
    dataSourceIcon: string,
    lastScanned: string
}

interface IScanData {
    temperature: string,
    id: string,
    name: string,
    location: string,
    lastVisitedCountry: string,
    isValid: boolean,
    feedback: any,
    buttonText: string,
    tempUnit: string
}

interface IEditFormData {
    buttonText: string,
    stateButtonText: string,
    feedback: any
}

interface ILocalProps {
    apiUrl: string,
    apiKey: string,
    basePath: string,
    renderInfo: any
}

interface ILocalState {
    userId: string,
    screened: number,
    employees: number,
    oranges: number,
    lastUpdated: string,
    sorting: IListFilter,
    data: IEmployeeDetails[],
    dialog: 'info' | 'precautions' | 'scann' | 'edit' | '',
    mapFilter: IStatType,
    scannData: IScanData,
    selected: IEmployeeDetails | null,
    editForm: IEditFormData,
    searchText: string
}

interface IListWidgetProps {
    items: IEmployeeDetails[],
    sorting: IListFilter,
    toggleStarred: any,
    selected: IEmployeeDetails,
    onSelectItem: any,
    searchText: string
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

        let cls = "";
        if (this.props.selected != null && this.props.selected._id == item._id) {
            cls = "selected"
        }

        return <div key={key} className={`item local-list ${cls} `}>

            <div className='c status' onClick={() => this.props.onSelectItem(item)}>
                <div className={`label ${item.status == null ? "" : item.status} `}></div>
                <div className='value'>{item.status == null ? "" : item.status}</div>
            </div>
            <div className=' c' onClick={() => this.props.onSelectItem(item)}>
                <div className='label'>Location</div>
                <div className='value'>{item.location} </div>
            </div>
            <div className='temperature c' onClick={() => this.props.onSelectItem(item)}>
                <div className='label'>Temperature</div>
                <div className={`value ${item.tempunit}`}>{item.temperature} </div>
            </div>
            <div className='name c' onClick={() => this.props.onSelectItem(item)}>
                <div className='label'>Name</div>
                <div className='value'>{item.name}</div>
            </div>
            <div className='last-country c' onClick={() => this.props.onSelectItem(item)}>
                <div className='label'>Countries Visited</div>
                <div className='value'>{item.countriesvisited}</div>
            </div>
            <div className='data-source c' onClick={() => this.props.onSelectItem(item)}>
                <div className='label'>Data Source</div>
                <div className='value'>
                    {/* {item.source} */}
                    {
                        item.source == null ? "" : <img src={`./images/datasources/${item.source.toLowerCase()}.png`} alt={item.source} />
                    }
                </div>
            </div>
            <div className={`c starred`}>
                <div className={`value starred ${item.starred ? "fill" : ""}  `} onClick={() => this.props.toggleStarred(item._id)} >
                </div>
            </div>
        </div>;
    }

    render() {
        let items = this.props.items;
        let starredItemsString = localStorage.getItem("starredItems");
        let starredItems = JSON.parse(starredItemsString);

        if (starredItems == null) {
            starredItems = [];
        }

        if (this.props.sorting == "starred") {
            items = items.filter((item: IEmployeeDetails) => {
                return (starredItems.indexOf(item._id) != -1);
            })
        }

        let searchText = this.props.searchText;
        
        if(searchText != null && searchText.trim().length > 0) {
            items = items.filter((item:IEmployeeDetails) => {
                let regExp = new RegExp(searchText, "i");
                return ((item.id == searchText) || (regExp.test(item.name)) );
            });
        }


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
            sorting: 'all',
            data: [],
            dialog: "",
            mapFilter: 'screened',
            scannData: {
                temperature: "",
                id: "",
                name: "",
                location: "",
                lastVisitedCountry: "",
                isValid: false,
                feedback: <span></span>,
                buttonText: "Submit",
                tempUnit: "celsius"
            },
            selected: null,
            editForm: {
                buttonText: "submit",
                stateButtonText: "check-in",
                feedback: ""
            },
            searchText: ""
        }

        this.submitForm = this.submitForm.bind(this);
        this.updateFormData = this.updateFormData.bind(this);
        this.updateEditFormData = this.updateEditFormData.bind(this);
        this.closeScanningForm = this.closeScanningForm.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.toggleItemStarred = this.toggleItemStarred.bind(this);
        this.onSelectItem = this.onSelectItem.bind(this);
        this.onCloseEditDialog = this.onCloseEditDialog.bind(this);
        this.submitEditForm = this.submitEditForm.bind(this);
        this.updateTempUnit = this.updateTempUnit.bind(this);
    }

    componentDidMount() {
        this.loadRemoteData();
        this.subscribe();
    }

    subscribe() {
        window.Lucy.MessageBus.init({ url: this.props.apiUrl, apiKey: this.props.apiKey })
            .then(() => {
                window.Lucy.MessageBus.subscribe('situation-dashboard', (value: string, channel: string) => {
                    // update status
                    var dataSet = this.state.data;
                    let NewRecord: IEmployeeDetails = JSON.parse(value);
                    dataSet.push(NewRecord);

                    let screened = this.state.screened;
                    let employees = this.state.employees;
                    let oranges = this.state.oranges;

                    if (NewRecord.temperature != null && NewRecord.temperature.trim().length > 0) {
                        screened++;
                    }
                    employees++;

                    this.setState({
                        data: dataSet,
                        screened: screened,
                        employees: employees,
                        oranges: oranges
                    });
                });
            });
    }

    async loadRemoteData(): Promise<{ details: IEmployeeDetails[] }> {
        try {
            console.log('fetching data...');

            let response = await fetch(this.props.apiUrl + "/Lucy/SituationalAwareness/users/today", {
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

            let screened = 0;
            let employees = 0;
            let oranges = 0;

            if (rawData) {
                details = rawData;

                // get localstorage data
                let starredItemsString = localStorage.getItem("starredItems");
                let starredItems = JSON.parse(starredItemsString);



                if (starredItems != null) {
                    let temp = details.map((item: IEmployeeDetails) => {
                        item.starred = (starredItems.indexOf(item._id) != -1);

                        item.tempunit = "celsius";

                        if (item.temperature != null && item.temperature.trim().length > 0) {
                            screened++;
                        }
                        employees++;

                        return item;
                    });

                    details = temp;
                }
            }

            //console.table(details);
            this.setState({
                data: details,
                lastUpdated: lastUpdate,
                screened: screened,
                employees: employees,
                oranges: oranges
            });

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
            <div className='dialog-sheet' onClick={this.closeScanningForm} />
            <div className='dialog scann-form'>
                <div className='header'>

                    <div className='title'>
                        New Screening Form
                        </div>
                    <div className='last'>

                        <div className='closer' onClick={this.closeScanningForm} />
                    </div>
                </div>
                <div className='body'>

                    <div className="form-group">
                        <label className="label" >Temperature</label>
                        <input type="text" name="temperature" className={`input ${this.state.scannData.temperature.trim().length == 0 ? "" : "filled"} `} value={this.state.scannData.temperature} placeholder="Example: 23" onChange={(event) => this.updateFormData(event, 'temperature')} />
                    </div>

                    <div className="form-group">
                        <label className="label" >Id  </label>
                        <input type="text" name="id" className={`input ${this.state.scannData.id.trim().length == 0 ? "" : "filled"} `} value={this.state.scannData.id} placeholder="Example: E123" onChange={(event) => this.updateFormData(event, 'id')} />
                    </div>

                    <div className="form-group">
                        <label className="label" >Name  </label>
                        <input type="text" name="name" className={`input ${this.state.scannData.name.trim().length == 0 ? "" : "filled"} `} value={this.state.scannData.name} placeholder="Example: John Doe" onChange={(event) => this.updateFormData(event, 'name')} />
                    </div>

                    <div className="form-group">
                        <label className="label" >Location  </label>
                        <input type="text" name="location" className={`input ${this.state.scannData.location.trim().length == 0 ? "" : "filled"} `} value={this.state.scannData.location} placeholder="Example: Singapore" onChange={(event) => this.updateFormData(event, 'location')} />
                    </div>

                    <div className="form-group">
                        <label className="label" >Countries Visited </label>
                        <input type="text" name="lastvisited" className={`input ${this.state.scannData.lastVisitedCountry.trim().length == 0 ? "" : "filled"} `} value={this.state.scannData.lastVisitedCountry} placeholder="Example: Kenya" onChange={(event) => this.updateFormData(event, 'lastVisited')} />
                    </div>

                    <div className="form-group">
                        {this.state.scannData.feedback}
                    </div>

                    <div className="form-group buttons">
                        <button type="button" className={`submit-button ${this.state.scannData.isValid ? "valid" : ""} `} onClick={this.submitForm}>
                            <span className="icon"></span>
                            {this.state.scannData.buttonText}
                        </button>
                    </div>

                </div>
            </div>

        </>;
    }

    renderEditForm() {
        return <>
            <div className='dialog-sheet' onClick={this.onCloseEditDialog} />
            <div className='dialog scann-form'>
                <div className='header'>

                    <div className='title edit'>
                        <label className={`${this.state.selected.status}`} >{this.state.selected.status}</label>
                    </div>
                    <div className='last'>
                        <div className='closer' onClick={this.onCloseEditDialog} />
                    </div>
                </div>
                <div className='body edit'>

                    <div className={`left`}>
                        <div className="form-group">
                            <label className="label" >Temperature</label>
                            <input type="text" name="temperature" className={`input ${this.state.selected.temperature != null && this.state.selected.temperature.trim().length == 0 ? "" : "filled"} `} value={this.state.selected.temperature} placeholder="Example: 23" onChange={(event) => this.updateEditFormData(event, 'temperature')} />

                            <span className="temp-units">
                                <span className={`temp-label ${this.state.selected.tempunit == "celsius" ? "selected" : ""}`} onClick={() => this.updateTempUnit("celsius")}>&#8451;</span>
                                <span className={`temp-label ${this.state.selected.tempunit == "fahrenheit" ? "selected" : ""} `} onClick={() => this.updateTempUnit("fahrenheit")}>&#8457;</span>
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="label" >Name  </label>
                            <input type="text" name="name" className={`input ${this.state.selected.name.trim().length == 0 ? "" : "filled"} `} value={this.state.selected.name} placeholder="Example: John Doe" onChange={(event) => this.updateEditFormData(event, 'name')} />
                        </div>

                        <div className="form-group">
                            <label className="label" >Location  </label>
                            <input type="text" name="location" className={`input ${this.state.selected.location.trim().length == 0 ? "" : "filled"} `} value={this.state.selected.location} placeholder="Example: Singapore" onChange={(event) => this.updateEditFormData(event, 'location')} />
                        </div>

                        <div className="form-group">
                            <label className="label" >Countries Visited </label>
                            <input type="text" name="lastvisited" className={`input ${this.state.selected.countriesvisited.trim().length == 0 ? "" : "filled"} `} value={this.state.selected.countriesvisited} placeholder="Example: Kenya" onChange={(event) => this.updateEditFormData(event, 'lastVisited')} />
                        </div>

                        <div className="form-group">
                            <label className="label" >Data Source </label>
                            <span className="value">{this.state.selected.source}</span>
                        </div>

                    </div>
                    <div className={`middle`}></div>
                    <div className={`right`}>

                        <div className="form-group">
                            <label className="label full-width" >Capture Image </label>
                            <div className="placeholder"></div>
                            <button className={`take-photo`}><span className={`icon`}></span> Take Photo </button>
                        </div>

                    </div>

                    <div className="form-group">
                        {this.state.editForm.feedback}
                    </div>

                    <div className="form-group buttons">

                        <button type="button" className={`check-in-button `} onClick={() => this.submitEditForm("status")}>
                            <span className="icon"></span>
                            {this.state.editForm.stateButtonText}
                        </button>

                        <button type="button" className={`save-changes-button `} onClick={() => this.submitEditForm("save")}>
                            <span className="icon"></span>
                            {this.state.editForm.buttonText}
                        </button>
                    </div>
                </div>
            </div>

        </>;
    }

    closeScanningForm() {
        let scannData = this.state.scannData;

        scannData.id = "";
        scannData.name = "";
        scannData.temperature = "";
        scannData.location = "";
        scannData.lastVisitedCountry = "";
        scannData.isValid = false;
        scannData.feedback = <span></span>;
        scannData.buttonText = "Submit"

        this.setState({
            scannData: scannData,
            dialog: ""
        });
    }

    updateFormData(event: React.ChangeEvent<HTMLInputElement>, filed: string) {
        let scannedData = this.state.scannData;
        let newValue = event.target.value

        switch (filed) {
            case "temperature":
                scannedData.temperature = newValue;
                break;
            case "id":
                scannedData.id = newValue;
                break;
            case "name":
                scannedData.name = newValue;
                break;
            case "location":
                scannedData.location = newValue;
                break;
            case "lastVisited":
                scannedData.lastVisitedCountry = newValue;
                break;
        }

        scannedData.isValid = scannedData.id.trim().length > 0 && scannedData.name.trim().length > 0 && scannedData.location.trim().length > 0 && scannedData.temperature.trim().length > 0 && scannedData.lastVisitedCountry.trim().length > 0;

        this.setState({ scannData: scannedData });
    }

    updateEditFormData(event: React.ChangeEvent<HTMLInputElement>, filed: string) {
        let selected = this.state.selected;
        let newValue = event.target.value

        switch (filed) {
            case "temperature":
                selected.temperature = newValue;
                break;
            case "name":
                selected.name = newValue;
                break;
            case "location":
                selected.location = newValue;
                break;
            case "lastVisited":
                selected.countriesvisited = newValue;
                break;
        }

        //scannedData.isValid = scannedData.id.trim().length > 0 && scannedData.name.trim().length > 0 && scannedData.location.trim().length > 0 && scannedData.temperature.trim().length > 0 && scannedData.lastVisitedCountry.trim().length > 0;

        this.setState({ selected: selected });
    }

    updateTempUnit(unit: string) {
        let selected = this.state.selected;
        selected.tempunit = unit;
        this.setState({ selected: selected });
    }

    submitForm() {

        let scanData = this.state.scannData;
        scanData.feedback = <span className="feedback info" >Your data is submitting...Please wait...</span>;
        scanData.buttonText = "Submitting...";

        this.setState({ scannData: scanData });

        if (this.state.scannData.isValid) {

            let temperature = this.state.scannData.temperature.trim();
            let tempUnit = this.state.scannData.tempUnit;
            if (tempUnit == "fahrenheit") {
                temperature = this.calcCelsiusValue(temperature);
            }

            // submit form 
            let _data = JSON.stringify({
                "id": this.state.scannData.id.trim(),
                "name": this.state.scannData.name.trim(),
                "location": this.state.scannData.location.trim(),
                "temperature": this.state.scannData.temperature.trim(),
                "source": "Lucy",
                "countriesvisited": temperature
            });

            fetch(this.props.apiUrl + "/Lucy/SituationalAwareness/users", {
                method: "post",
                headers: {
                    'Authorization': 'APIKEY ' + this.props.apiKey,
                    'Content-Type': 'application/json'
                },
                body: _data
            })
                .then((res) => res.json())
                .then(response => {

                    //console.log(response);

                    if (response._id) {
                        let scannedData = this.state.scannData;

                        scannedData.id = "";
                        scannedData.name = "";
                        scannedData.temperature = "";
                        scannedData.lastVisitedCountry = "";
                        scannedData.location = "";
                        scannedData.isValid = false;
                        scannedData.feedback = <span className="feedback success">Record Added Successfully!</span>;
                        scanData.buttonText = "Submit";

                        this.setState({ scannData: scannedData });
                    }
                })
                .catch(err => {

                    let scannedData = this.state.scannData;
                    scannedData.feedback = <span className="feedback error">Oops! something went wrong</span>;
                    scanData.buttonText = "Submit";
                    this.setState({ scannData: scannedData });

                    console.log(err);
                    throw err;
                })
        }
    }

    updateUserState() {
        let editForm = this.state.editForm;
        editForm.feedback = <span className="feedback info" >Your data is submitting...Please wait...</span>;
        editForm.stateButtonText = "Submitting...";

        this.setState({ editForm: editForm });


    }

    submitEditForm(type: string) {
        let editForm = this.state.editForm;
        editForm.feedback = <span className="feedback info" >Your data is submitting...Please wait...</span>;

        if (type == "status") {
            editForm.stateButtonText = "Submitting...";
        }
        else {
            editForm.buttonText = "Submitting...";
        }
        this.setState({ editForm: editForm });


        let selected = this.state.selected;
        let isValid = selected.temperature.trim().length > 0 && selected.name.trim().length > 0 && selected.countriesvisited.trim().length > 0 && selected.location.trim().length > 0;

        if (isValid) {

            status = selected.status == null ? "" : selected.status;
            //console.log(typeof status);
            if (type == "status") {
                status = status == "check-in" ? "check-out" : "check-in";
            }

            let temperature = selected.temperature.trim();
            let tempUnit = selected.tempunit;
            if (tempUnit != "celsius") {
                temperature = this.calcCelsiusValue(temperature);
            }

            // submit form 
            let _data = JSON.stringify({
                "name": selected.name.trim(),
                "location": selected.location.trim(),
                "temperature": temperature,
                "countriesvisited": selected.countriesvisited.trim(),
                "_id": selected._id,
                "id": selected.id,
                "status": status
            });

            fetch(this.props.apiUrl + "/Lucy/SituationalAwareness/users/update", {
                method: "PATCH",
                headers: {
                    'Authorization': 'APIKEY ' + this.props.apiKey,
                    'Content-Type': 'application/json'
                },
                body: _data
            })
                .then((res) => res.json())
                .then(response => {

                    let selected = response;

                    let editForm = this.state.editForm;
                    editForm.feedback = <span className="feedback success">Your changes saved successfully</span>;
                    editForm.buttonText = "Submit";
                    editForm.stateButtonText = selected.status == "check-in" ? "check-out" : "check-in";

                    // update data set
                    let data = this.state.data;

                    let starredItemsString = localStorage.getItem("starredItems");
                    let starredItems = JSON.parse(starredItemsString);

                    if (starredItems == null) {
                        starredItems = [];
                    }

                    let screened = 0;
                    let employees = 0;
                    let oranges = 0;

                    var updated = data.map(item => {

                        if (item._id == selected._id) {
                            item = selected;
                        }

                        item.starred = (starredItems.indexOf(item._id) != -1);
                        item.tempunit = "celsius";

                        if (item.temperature != null && item.temperature.trim().length > 0) {
                            screened++;
                        }
                        employees++;

                        return item;
                    });

                    this.setState({
                        editForm: editForm,
                        data: updated,
                        selected: selected,
                        screened: screened,
                        employees: employees,
                        oranges: oranges
                    });
                })
                .catch(err => {

                    let editForm = this.state.editForm;
                    editForm.feedback = <span className="feedback error">Oops! something went wrong</span>;
                    editForm.buttonText = "Submit";
                    editForm.stateButtonText = this.state.selected.status == "check-in" ? "check-out" : "check-in";
                    this.setState({ editForm: editForm });

                    console.log(err);
                    throw err;
                })

        }
        else {
            editForm.feedback = <span className="feedback error" >Please Complete the form</span>;

            if (type == "status") {
                editForm.stateButtonText = selected.status == "check-in" ? "check-out" : "check-in";
            }
            else {
                editForm.buttonText = "Submit";
            }

            this.setState({ editForm: editForm });
        }
    }



    toggleItemStarred(_id: string) {

        let starredItemsString = localStorage.getItem("starredItems");
        let starredItems = JSON.parse(starredItemsString);

        if (starredItems == null) {
            starredItems = [];
        }

        // check if item exist in localstorage
        let index = starredItems.indexOf(_id);
        //console.log("index-" + index);

        if (index == -1) {
            starredItems.push(_id);
        }
        else {
            starredItems.splice(index, 1);
        }

        // update data list 
        let data = this.state.data;
        data.map((item, key) => {
            if (item._id == _id) {
                item.starred = !item.starred;
            }
        })

        this.setState({ data: data });

        localStorage.setItem("starredItems", JSON.stringify(starredItems));

    }

    onSelectItem(item: IEmployeeDetails) {
        this.setState({
            selected: item,
            dialog: "edit",
            editForm: {
                stateButtonText: item.status == "check-in" ? "check-out" : "check-in",
                buttonText: "Submit",
                feedback: ""
            }
        })
    }

    onCloseEditDialog() {
        this.setState({
            selected: null,
            dialog: ""
        })
    }

    calcCelsiusValue(fahrenheit: string) {
        let F = parseFloat(fahrenheit);

        if (isNaN(F)) {
            throw "Temperature should be a numbber";
        }

        let C = (5 / 9) * (F - 32);
        C = Math.round((C + 0.00001) * 100) / 100;
        return C.toString();
    }

    render() {

        var dialog = <></>;

        if (this.state.dialog == "precautions") {
            dialog = this.renderPrecautions();
        }
        else if (this.state.dialog == "scann") {
            dialog = this.renderScanningForm();
        }
        else if (this.state.dialog == "edit") {
            dialog = this.renderEditForm();
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
                        <div className='title'>Expected</div>
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
                                Today
                            </div>
                            <div className='filters'>
                                <input type="text" name="search" className="search" placeholder="search by name or id" value={this.state.searchText} onChange={(event) => this.setState({searchText: event.target.value})} />
                                <div onClick={this.setSorting.bind(this, 'starred')} className={(this.state.sorting == 'starred' ? 'set' : '') + ' switch starred'}><span className="icon star"></span>starred</div>
                                <div onClick={this.setSorting.bind(this, 'all')} className={(this.state.sorting == 'all' ? 'set' : '') + ' switch all'}>All {/* <span className="icon arrow"></span> */} </div>

                            </div>
                        </div>
                        <ListWidget sorting={this.state.sorting} searchText={this.state.searchText} items={this.state.data} toggleStarred={this.toggleItemStarred} selected={this.state.selected} onSelectItem={this.onSelectItem} />
                        <div className='footer'>
                            <div className='tip'>Learn more about this dashboard</div>
                            <div className='action' onClick={this.props.renderInfo}>Info</div>
                        </div>
                    </div>
                </div>

                <div className='map local-map'>
                    <div className='map-widget'>
                        <div className='filters'>
                            <div onClick={this.setMapFilter.bind(this, 'screened')} className={(this.state.mapFilter == 'screened' ? 'set' : '') + ' switch screened'}><span className="icon"></span> screened</div>
                            <div onClick={this.setMapFilter.bind(this, 'employees')} className={(this.state.mapFilter == 'employees' ? 'set' : '') + ' switch employees'}><span className="icon"></span>Expected</div>
                            <div onClick={this.setMapFilter.bind(this, 'oranges')} className={(this.state.mapFilter == 'oranges' ? 'set' : '') + ' switch oranges'}><span className="icon"></span>oranges</div>
                        </div>

                        <MapWidget items={this.state.data} />
                    </div>
                </div>


            </div>

            <div className={`bottom-bar`} >
                <div className={`scanning-button`} onClick={() => this.setState({ dialog: "scann" })}></div>
            </div>

            {dialog}

        </>);
    }
}

export default LocalDashboard;