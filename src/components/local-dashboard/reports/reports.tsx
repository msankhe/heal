import * as React from 'react';

import ContactTracing from './contact-tracing';
import {EmployeeStatus} from './employee-status';
let AllReports = [
    {name:'contact-tracking',title:'Contact Tracking',component:ContactTracing},
    {name:'employee-status',title:'Employee Status',component:EmployeeStatus},
];
function getReportDetails(report:string) {
    for(var i=0;i<AllReports.length;i++) {
        if (AllReports[i].name === report) {
            return AllReports[i];
        }
    }
    return null;
}

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
        this.showReportsView = this.showReportsView.bind(this);
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
                this.setState({ searchResult: res });
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    }

    showReportsView() {
        this.setState({ selectedReport: null });
    }

    renderReports() {
       
        return (
            <div className="reports">
                {
                    AllReports.map(r => (
                        <div className={"report-card " + r.name} onClick={() => this.onSelectReport(r.name)}>
                            <div className={"report-image " + r.name} />
                            <div className="report-name"> {r.title}</div>
                        </div>
                    ))

                }

            </div>
        );
    }

    onSelectReport(report: string) {

        let title = "Health Reports";
        let reportDetails = getReportDetails(report);
        if (!!reportDetails) {
            title = reportDetails.title;
        }
        

        this.setState({
            selectedReport: report,
            title: title
        });
    }

    render() {

        let content = <div></div>;
        let reportDetails = getReportDetails(this.state.selectedReport);
        if (reportDetails) {
            let RC = reportDetails.component;
            content = <RC items={this.state.searchResult} onSearch={this.searchCallback} 
            searchText={this.state.searchText} 
                apiUrl={this.props.apiUrl} 
                apiKey={this.props.apiKey} 
                goBack={this.showReportsView}
                 />;
        } else {
            content = this.renderReports();
        }
        /*switch (this.state.selectedReport) {
            case "contact-tracking":
                content = <ContactTracing items={this.state.searchResult} onSearch={this.searchCallback} 
                searchText={this.state.searchText} 
                apiUrl={this.props.apiUrl} 
                apiKey={this.props.apiKey} 
                goBack={this.showReportsView}
                 />;
                break;

            default:
                content = this.renderReports();
        }*/

        let searchBoxClass = "search-box";
        if(this.state.searchText.length > 0) {
            searchBoxClass += " filled";
        }
        if(this.state.selectedReport == null) {
            searchBoxClass += " hide"
        }

        return (
            <div className="report-section">
                <div className="report-container">
                    <div className="header">
                        <div className="title"><span className={`arrow ${this.state.selectedReport == null ? "hide" : ""}`}></span> {this.state.title}</div>
                        <div className="last-updated">
                            {
                                this.state.searchText.length > 0 ?
                                    <><i>Showing Results for&nbsp;&nbsp;</i> <span>"{this.state.searchText}"</span></>
                                    :
                                    ""
                            }

                        </div>

                        <div className="filters">
                            <div className={searchBoxClass}>
                                <input type="text" className={`search `} placeholder="search by name or email" value={this.state.searchText} onChange={event => this.onSearch(event)} />
                                <span className="close-button" onClick={() => this.setState({searchText: ""})}></span>
                            </div>
                        </div>
                    </div>

                    <div className="body">

                        {content}

                    </div>

                </div>
            </div>
        );
    }
}

export default Reports;