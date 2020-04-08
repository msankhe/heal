import * as React from 'react';

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
    email: string,
    healthflag: string,

    lat: number,
    long: number,
    locationName: string,
    dataSourceIcon: string,
    lastScanned: string
}

interface IProps {
    onSearch: any,
    items: IEmployeeDetails[]
}

interface IState {
    searchText: string,
    tempSearchText: string

}

interface ISearchResultProps {
    items: IEmployeeDetails[]
}

interface ISearchResultState {

}

class SearchResult extends React.Component<ISearchResultProps, ISearchResultState>{


    constructor(props: ISearchResultProps) {
        super(props);

        this.state = {

        }
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
                <div className={`column time`}>
                    <span className="time">08.00 AM</span>
                    <span className="connector"></span>
                    <span className="contacted">Contacted "Jamie Thompson"</span>
                </div>
                <div className={`column trace`}>
                    <div className="trace-button">
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

    render() {


        return (
            <div className="search-result-container">
                {
                    this.props.items.map((item, key) => this.renderItems(item, key))
                }
            </div>
        );
    }
}

class ContactTracing extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            searchText: "",
            tempSearchText: ""
        }

        this.onSearch = this.onSearch.bind(this);
        this.onClickSearchbutton = this.onClickSearchbutton.bind(this);

    }

    onSearch(event: React.ChangeEvent<HTMLElement>) {

    }

    onClickSearchbutton() {
        let tempSearchText = this.state.tempSearchText;

        this.setState({
            searchText: tempSearchText,
            tempSearchText: ""
        });
    }

    render() {

        return (
            <div className="contact-tracing-block">

                {

                    this.state.searchText.length > 0 ?
                        <SearchResult items={this.props.items} />
                        :

                        <div className="search-box">
                            <input type="text" name="search" className="search" placeholder="search by name or email" value={this.state.tempSearchText} onChange={(event) => { this.setState({ tempSearchText: event.target.value }) }} />
                            <span className={`search-button`} onClick={this.onClickSearchbutton} ></span>
                        </div>

                }
            </div>
        );
    }
}

export default ContactTracing;