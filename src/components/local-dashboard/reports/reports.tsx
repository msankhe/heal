import * as React from 'react';

interface IProps {

}

interface IState {
    title: string,
    selectedReport: string,
    searchText: string,

}

class Reports extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            title: "Health Reports",
            selectedReport: null,
            searchText: ""
        }

        this.renderReports = this.renderReports.bind(this);
    }

    onSearch(event: React.ChangeEvent<HTMLElement>) {

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
        switch(report) {
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
                content = <></>;
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
                        <div className="back-button-container">
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