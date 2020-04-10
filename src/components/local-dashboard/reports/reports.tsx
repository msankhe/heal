import * as React from 'react';

import ContactTracing from './contact-tracing';


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
                <div className="report-card" onClick={() => this.onSelectReport("contact-tracking")}>

                    <img className="report-img" alt="contact" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4NS42IDY4LjI3Ij48ZGVmcz48c3R5bGU+LmNscy0xe29wYWNpdHk6MC40O30uY2xzLTIsLmNscy0ze2ZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC41cHg7fS5jbHMtM3tzdHJva2UtZGFzaGFycmF5OjYuODUgNi44NTt9LmNscy00e2ZpbGw6IzQyNDI0Mjt9LmNscy01e2ZpbGw6I2Y5ZDZiYjt9LmNscy02e2ZpbGw6I2Y1ODIyMDt9PC9zdHlsZT48L2RlZnM+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj48ZyBjbGFzcz0iY2xzLTEiPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjU4LjE2IiB5MT0iNjYuNzYiIHgyPSI2MS42NiIgeTI9IjY2Ljc2Ii8+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNNjguNTEsNjYuNzZoNy43MWE5LjE0LDkuMTQsMCwwLDAsOS4xMy05LjE0VjkuMzlBOS4xNCw5LjE0LDAsMCwwLDc2LjIyLjI1SDEyLjczQTkuMTQsOS4xNCwwLDAsMCwzLjYsOS4zOVYyMS42MiIvPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjMuNiIgeTE9IjI1LjA0IiB4Mj0iMy42IiB5Mj0iMjguNTQiLz48L2c+PHBhdGggY2xhc3M9ImNscy00IiBkPSJNNy4zNSwzMy40NGMwLDItMy42OCw4LjU4LTMuNjgsOC41OFMwLDM1LjQ3LDAsMzMuNDRhMy42OCwzLjY4LDAsMCwxLDcuMzUsMFpNMy42NywzMmExLjM4LDEuMzgsMCwxLDAsMS4zOCwxLjM4QTEuMzcsMS4zNywwLDAsMCwzLjY3LDMyWiIvPjxwYXRoIGNsYXNzPSJjbHMtNSIgZD0iTTY1LjU1LDM0Ljc4YTE5LjcsMTkuNywwLDEsMS0xOS43LTE5LjY5QTE5LjcsMTkuNywwLDAsMSw2NS41NSwzNC43OFoiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik01OC42Miw2NC44NmExOS40NywxOS40NywwLDAsMC0yNy41NSwwLDIsMiwwLDEsMCwyLjgyLDIuODIsMTUuNSwxNS41LDAsMCwxLDIxLjksMCwyLDIsMCwxLDAsMi44My0yLjgyWiIvPjxwYXRoIGNsYXNzPSJjbHMtNCIgZD0iTTYxLjc5LDM3LjM1YTI1LjA4LDI1LjA4LDAsMCwxLDEuNzgtMi44NGMuNjMtLjkyLDEuODQtMi4zNSwyLjU3LTMuMmwwLC4yMmMtLjM5LS4zLS43NC0uNjUtMS4xMS0xLC40My4yNC44OC40NSwxLjI5LjcybC4xMi4wOC0uMDkuMTNjLS41OCwxLTEuNzYsMi40LTIuNDQsMy4yOUEyNi4zNiwyNi4zNiwwLDAsMSw2MS43OSwzNy4zNVoiLz48cGF0aCBjbGFzcz0iY2xzLTQiIGQ9Ik01Ny4xNSw0OS4zMmMyLjc0LTQuNzIsNi4zMi05LjM4LDkuNTEtMTMuOGwwLC4xMS0xLjE1LS45LDEuMjQuNzcuMDYsMCwwLC4wN0M2NCw0MC4yOSw2MC40MSw0NC45NCw1Ny4xNSw0OS4zMloiLz48cGF0aCBjbGFzcz0iY2xzLTQiIGQ9Ik0yOS4yNCwzNy4zNWEyNi40NiwyNi40NiwwLDAsMS0yLjE2LTIuNTdjLS42Ny0uODktMS4zMS0xLjgtMS45LTIuNzVsLS4wOC0uMTQuMTItLjA4Yy40MS0uMjYuODUtLjQ4LDEuMjgtLjcyLS4zNy4zMy0uNzIuNjctMS4xMSwxbDAtLjIxYTMyLjc2LDMyLjc2LDAsMCwxLDIsMi42NkEyNS4wOCwyNS4wOCwwLDAsMSwyOS4yNCwzNy4zNVoiLz48cGF0aCBjbGFzcz0iY2xzLTQiIGQ9Ik0zMy44OCw0OS4zMmMtMy4yNi00Ljc2LTYuMTktOS4xMi05LTE0LjE2bDAtLjA3LjA1LDAsMS4yNC0uNzhMMjUsMzUuMThsMC0uMTFBMTY3LjM3LDE2Ny4zNywwLDAsMSwzMy44OCw0OS4zMloiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik00NS45MSw4LjM4aDBBMTkuMjUsMTkuMjUsMCwwLDEsNjUuMTYsMjcuNjNWMjhhMCwwLDAsMCwxLDAsMEgyNi42NmEwLDAsMCwwLDEsMCwwdi0uNEExOS4yNSwxOS4yNSwwLDAsMSw0NS45MSw4LjM4WiIvPjxwYXRoIGNsYXNzPSJjbHMtNiIgZD0iTTQ1LjUzLDU0LjI5aDBBMTYuMzcsMTYuMzcsMCwwLDEsMjkuMjYsNDAuMTFsLS43Ny01Ljg4LDExLjEyLDQuNTQuNTQuMTJhMzAuMTgsMzAuMTgsMCwwLDAsNi4zNS42OCwyMS4zOSwyMS4zOSwwLDAsMCw3LjEyLTEuMjlMNjQsMzQuNjEsNjEuMSw0My4xNEExNi4zOSwxNi4zOSwwLDAsMSw0NS41Myw1NC4yOVoiLz48L2c+PC9nPjwvc3ZnPg==" />

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
                content = <ContactTracing items={this.state.searchResult} onSearch={this.searchCallback} searchText={this.state.searchText} apiUrl={this.props.apiUrl} apiKey={this.props.apiKey} goBack={this.showReportsView} />;
                break;

            default:
                content = this.renderReports();
        }

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