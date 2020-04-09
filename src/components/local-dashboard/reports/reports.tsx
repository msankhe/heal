import * as React from 'react';

import ContactTracing from './contact-tracing';


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
    apiUrl: string,
    apiKey: string
}

interface IState {
    title: string,
    selectedReport: string,
    searchText: string,
    searchResult: IEmployeeDetails[]
}

class Reports extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            title: "Health Reports",
            selectedReport: null,
            searchText: "",
            searchResult: []
        }

        this.renderReports = this.renderReports.bind(this);
        this.searchCallback = this.searchCallback.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    onSearch(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ searchText: event.target.value });
        this.searchUsers(event.target.value);
    }

    searchCallback(searchText: string) {
        this.setState({ searchText: searchText });
        this.searchUsers(searchText);
    }

    searchUsers(searchText: string) {
        let _data = JSON.stringify({
            searchtext: searchText
        });
        fetch(this.props.apiUrl + "/Lucy/SituationalAwareness/users/search", {
            method: 'POST',
            headers: {
                'Authorization': 'APIKEY ' + this.props.apiKey,
                'Content-Type': 'application/json'
            },
            body: _data
        })
        .then(res => res.json()) 
        .then(res => {
            this.setState({searchResult: res});
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }

    renderReports() {
        return (
            <div className="reports">
                <div className="report-card" onClick={() => this.onSelectReport("contact-tracking")}>
                    <img src="./images/report/contact-tracking.svg" className="report-img" alt="contact" />

                    <div className="report-name"> Contact Tracking </div>
                </div>

                <div className="report-card" onClick={() => this.onSelectReport("other")}>
                    <img src="./images/report/contact-tracking.svg" className="report-img" alt="contact" />

                    <div className="report-name"> Contact Tracking </div>
                </div>


            </div>
        );
    }

    onSelectReport(report: string) {

        let title = "Health Reports";
        switch (report) {
            case "contact-tracking":
                title = "Contact Tracing";
                break;
        }

        this.setState({
            selectedReport: report,
            title: title
        });
    }

    render() {

        let content = <div></div>;

        switch (this.state.selectedReport) {
            case "contact-tracking":
                content = <ContactTracing items={this.state.searchResult} onSearch={this.searchCallback} searchText={this.state.searchText} apiUrl={this.props.apiUrl} apiKey={this.props.apiKey} />;
                break;

            default:
                content = this.renderReports();
        }

        return (
            <div className="report-section">
                <div className="report-container">
                    <div className="header">
                        <div className="title"><span className={`arrow ${this.state.selectedReport == null ? "hide" : ""}`}></span> {this.state.title}</div>
                        <div className="last-updated">
                            <i>Last updated </i> <span>06.00 AM</span>
                        </div>

                        <div className="filters">
                            <div className={`search-box ${this.state.selectedReport == null ? "hide" : ""}`}>
                                <input type="text" className={`search `} placeholder="search by name or email" value={this.state.searchText} onChange={event => this.onSearch(event)} />
                            </div>
                        </div>
                    </div>

                    <div className="body">
                        <div className={`back-button-container ${this.state.selectedReport == null ? "hide" : ""}`}>
                            <div className="back-button" onClick={() => this.onSelectReport(null)}>Reports Home</div>
                        </div>

                        {content}

                    </div>

                </div>
            </div>
        );
    }
}

export default Reports;