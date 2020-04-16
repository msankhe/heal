import * as React from 'react';

declare const window: any;

interface IEmployeeDetails {
    _id: string,
    id: string,
    name: string,
    location: string,
    temperature: string,
    source: string,
    countriesvisited: string,
    currentstatus: string,
    checkinat: Date,
    checkoutat: Date,
    createdat: Date,
    email: string,
    expectedat: Date,
    healthflag: string,
    status: string,
    contactnumber: string,
    starred: boolean,
    tempunit: string,

    lat: number,
    long: number,
    locationName: string,
    dataSourceIcon: string,
    lastScanned: string
}

interface IProps {
    apiUrl: string,
    apiKey: string,
    onSearch: any,
    items: IEmployeeDetails[],
    searchText: string,
    goBack: any
}

interface IState {
    searchText: string,
    tempSearchText: string

}

interface ISearchResultProps {
    apiUrl: string,
    apiKey: string,
    items: IEmployeeDetails[],
    goBack: any,
    searchText: string
}

interface ITracing {
    location: string,
    time: string,
    people: IEmployeeDetails[]
}

interface ISearchResultState {
    selected: IEmployeeDetails,
    tracingDetails: ITracing[]
}

class SearchResult extends React.Component<ISearchResultProps, ISearchResultState>{


    constructor(props: ISearchResultProps) {
        super(props);

        this.state = {
            selected: null,
            tracingDetails: []
        }
    }

    componentDidUpdate(prevProps: ISearchResultProps) {
        if (prevProps.searchText.length != this.props.searchText.length) {
            this.setState({ selected: null });
        }
    }

    getTracingDetails(item: IEmployeeDetails) {
        this.setState({ selected: item });

        // get tracing 
        fetch(this.props.apiUrl + "/Lucy/SituationalAwareness/users/reports/contact-tracing", {
            method: 'GET',
            headers: {
                'Authorization': 'APIKEY ' + this.props.apiKey,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                this.setState({ tracingDetails: res });
            })
            .catch(err => {
                console.log(err);

                throw err;
            })
    }

    renderItems(item: IEmployeeDetails, key: number) {
        console.log(item);
        let temperatue = null;
        if (item.temperature !== null && item.temperature !== "") {
            temperatue = item.temperature;
        }

        return (
            <div className={`result-item`} key={key}>
                <div className={`column status ${item.status == null ? "" : item.status}`}>

                </div>
                <div className={`column name`}>
                    {item.name}
                    {
                        temperatue == null ? "" : <span className={`temp ${item.temperature != null ? item.temperature !== "" ? item.tempunit : "" : ""}`}>{temperatue} </span>
                    }

                </div>
                <div className={`column temperature`}>
                    {
                        temperatue == null ? "" : <span className={`temp ${item.temperature != null ? item.temperature !== "" ? item.tempunit : "" : ""}`}>{temperatue} </span>
                    }
                </div>
                <div className={`column details`}>
                    <span className="time">08.00 AM {item.location == null ? "" : item.location}</span>
                    <span className="connector"></span>
                    <span className="contacted">Contacted "Jamie Thompson"</span>
                </div>
                <div className={`column trace`}>
                    <div className="trace-button" onClick={() => this.getTracingDetails(item)}>
                        Trace
                    </div>
                </div>
                <div className={`column star`}></div>
                <div className={`column count`}>
                    08 others
                </div>
            </div>
        );
    }

    renderSearchResult() {
        return <>
            <div className={`back-button-container`}>
                <div className="back-button" onClick={() => this.props.goBack()}>Back to search</div>
            </div>
            <div className="search-result-container">
                {
                    this.props.items.length > 0 ?
                        this.props.items.map((item, key) => this.renderItems(item, key))
                        :
                        <div className="no-result">No record found</div>
                }
            </div>
        </>;
    }


    renderEmployeeDetails(employ: IEmployeeDetails, key: number) {

        return (
            <div className="item" key={key}>
                <div className="name">{employ.name}</div>
                <div className="other">
                    <span className="email">{employ.email}</span>
                    <span className="tel">{employ.contactnumber}</span>

                    {/* <span className="star"></span> */}
                </div>
            </div>
        );

    }
    renderTracingDetails(item: ITracing, key: number) {

        let header = <div className="header">
            {/* <span className="star"></span> */}
        </div>;

        if (key == 0) {
            header = <>
                <div className="header">
                    <span className="email">{this.state.selected.email}</span>
                    <span className="tel">{this.state.selected.contactnumber}</span>

                    {/* <span className="star"></span> */}
                </div>;

                <div className="sub-header">
                    <div className="name">{this.state.selected.name}</div>
                    <div className="temperature celsius">{this.state.selected.temperature}</div>
                </div>
            </>
        }

        return (
            <div className="details-block" key={key} id={`tracing-block-${key}`} >

                {header}

                <div className="details">
                    <div className="title">{item.time}  {item.location}</div>

                    {
                        item.people.map((emp, key) => this.renderEmployeeDetails(emp, key))
                    }

                </div>


            </div>
        );
    }

    renderTracingNavItem(item: ITracing, key: number) {

        return (
            <a className="nav-item" key={key} href={`#tracing-block-${key}`} >
                {item.time} {item.location}
            </a>
        );
    }

    onScroll() {
        console.log("scroll");
    }

    renderTracing() {
        return <>
            <div className={`back-button-container`}>
                <div className="back-button" onClick={() => this.setState({ selected: null })}>Back to search results</div>
            </div>
            <div className="tracing-container">
                <div className="tracing-details" onScroll={this.onScroll}>

                    {
                        this.state.tracingDetails.map((item, key) => this.renderTracingDetails(item, key))
                    }

                </div>
                <div className="tracing-nav">
                    {
                        this.state.tracingDetails.map((item, key) => this.renderTracingNavItem(item, key))
                    }
                </div>
            </div>
        </>;
    }

    render() {


        return (<>

            {
                this.state.selected == null ?
                    this.renderSearchResult()
                    :
                    this.renderTracing()
            }


        </>);
    }
}

class ContactTracing extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            searchText: "",
            tempSearchText: ""
        }

        this.onClickSearchbutton = this.onClickSearchbutton.bind(this);
        this.showSearchView = this.showSearchView.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);

    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll, true);
    }

    handleScroll () {
        //console.log("scrolled");
        //console.log(window.scrollY);
    }

    onClickSearchbutton() {
        let tempSearchText = this.state.tempSearchText;

        this.setState({
            searchText: tempSearchText
        });

        this.props.onSearch(tempSearchText);
    }

    onKeyPress(event: React.KeyboardEvent) {
        if (event.keyCode == 13) {
            this.onClickSearchbutton();
        }
    }

    showSearchView() {
        this.setState({ searchText: "" });
        this.props.onSearch("");
    }

    render() {

        let searchBoxClass = "search-box";
        if(this.state.searchText.length > 0 || this.state.tempSearchText.length > 0) {
            searchBoxClass += " filled";
        }

        return (
            <div className="contact-tracing-block">

                {
                    this.props.searchText.length > 0 ?
                        <SearchResult searchText={this.props.searchText} items={this.props.items} apiUrl={this.props.apiUrl} apiKey={this.props.apiKey} goBack={this.showSearchView} />
                        :
                        <>
                            <div className={`back-button-container`}>
                                <div className="back-button" onClick={() => this.props.goBack()}>Reports Home</div>
                            </div>
                            <div className={searchBoxClass}>
                                <input type="text" name="search" className="search" placeholder="search by name or email" value={this.state.tempSearchText} onChange={(event) => { this.setState({ tempSearchText: event.target.value }) }} onKeyDown={(event) => this.onKeyPress(event)} />
                                <span className={`search-button`} onClick={this.onClickSearchbutton} ></span>
                            </div>
                        </>
                }
            </div>
        );
    }
}

export default ContactTracing;