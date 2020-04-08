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
    selected: IEmployeeDetails
}

class SearchResult extends React.Component<ISearchResultProps, ISearchResultState>{


    constructor(props: ISearchResultProps) {
        super(props);

        this.state = {
            selected: null
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
                <div className={`column details`}>
                    <span className="time">08.00 AM {item.location == null ? "" : item.location}</span>
                    <span className="connector"></span>
                    <span className="contacted">Contacted "Jamie Thompson"</span>
                </div>
                <div className={`column trace`}>
                    <div className="trace-button" onClick={() => this.setState({ selected: item })}>
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
        return <div className="search-result-container">
            {
                this.props.items.map((item, key) => this.renderItems(item, key))
            }
        </div>;
    }

    renderTracing() {
        return <>
            <div className="tracing-container">
                <div className="tracing-details">

                    <div className="details-block">
                        <div className="header">
                            <span className="email">jamieT@iviva.com</span>
                            <span className="tel">+1(504)43227645</span>

                            <span className="star"></span>
                        </div>

                        <div className="sub-header">
                            <div className="name">Jannet Lauren Smith</div>
                            <div className="temperature celsius">37.6</div>
                        </div>

                        <div className="details">
                            <div className="title">10.00 AM Meeting</div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                        </div>


                    </div>

                    <div className="details-block">
                        <div className="header">

                            <span className="star"></span>
                        </div>

                        <div className="details">
                            <div className="title">01.00 PM cafeteria</div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                            <div className="item">
                                <div className="name">Jamie Thompson</div>
                                <div className="other">
                                    <span className="email">jamieT@iviva.com</span>
                                    <span className="tel">+1(504)43227645</span>

                                    <span className="star"></span>
                                </div>
                            </div>

                        </div>


                    </div>

                </div>
                <div className="tracing-nav">
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
                    <div className="nav-item">
                        10.00 am Meeting
                    </div>
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

        this.onSearch = this.onSearch.bind(this);
        this.onClickSearchbutton = this.onClickSearchbutton.bind(this);

    }

    onSearch(event: React.ChangeEvent<HTMLElement>) {

    }

    onClickSearchbutton() {
        let tempSearchText = this.state.tempSearchText;

        this.setState({
            searchText: tempSearchText
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