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

}

interface IState {
    searchText: string,
    tempSearchText: string

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

    onClickSearchbutton () {
        let tempSearchText = this.state.tempSearchText;
        this.setState({searchText: tempSearchText, tempSearchText: ""});
    }

    render() {

        return (
            <div className='data-section'>
                <div className='data-list-container tracing-list'>
                    <div className='data-list'>
                        <div className='header'>
                            <div className='title'>
                                <span className="arrow"></span>
                                Contact Tracing
                            </div>
                            <div className={`last-updated`}><i>Last Updated</i> <span>06.00 AM </span></div>
                            <div className='filters'>
                                <div className="search-container">
                                    <input type="text" name="search" className="search" placeholder="search by name or email" value={this.state.searchText} onChange={(event) => this.onSearch(event)} />
                                </div>
                            </div>
                        </div>

                        {
                            this.state.searchText == "" ?
                                <div className="search-box">
                                    <input type="text" name="search" className="search" placeholder="search by name or email" value={this.state.tempSearchText} onChange={(event) => {this.setState({tempSearchText: event.target.value})}}  />
                                    <span className={`search-button`} onClick={this.onClickSearchbutton} ></span>
                                </div>
                                :
                                <div></div>
                        }

                        {/* <div className='footer'>
                            <div className='tip'>Learn more about this dashboard</div>
                            <div className='action' onClick={this.props.renderInfo}>Info</div>
                        </div> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default ContactTracing;