import * as React from 'react';

import ContactTracing from './contact-tracing';
import { EmployeeStatus } from './employee-status';
let AllReports = [
    { name: 'contact-tracking', title: 'Contact Tracking', component: ContactTracing },
    { name: 'employee-status', title: 'Employee Status', component: EmployeeStatus },
];
function getReportDetails(report: string) {
    for (var i = 0; i < AllReports.length; i++) {
        if (AllReports[i].name === report) {
            return AllReports[i];
        }
    }
    return null;
}

interface IProps {
    apiUrl: string,
    apiKey: string
}

interface IState {
    selectedReport: string
}

class Reports extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            selectedReport: null,
        }

        this.renderReports = this.renderReports.bind(this);
        this.showReportsView = this.showReportsView.bind(this);
    }

    onSelectReport(report: string) {
        this.setState({
            selectedReport: report
        });
    }

    showReportsView() {
        this.setState({ selectedReport: null });
    }

    renderReports() {

        return (

            <div className="report-section">
                <div className="report-container">

                    <div className="header">
                        <div className="title">Health Reports</div>
                    </div>

                    <div className="body">

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

                    </div>

                </div>
            </div>

        );
    }

    render() {

        let content = <div></div>;

        let reportDetails = getReportDetails(this.state.selectedReport);

        if (reportDetails) {

            let RC = reportDetails.component;
            content = <RC 
                apiUrl={this.props.apiUrl}
                apiKey={this.props.apiKey}
                goBack={this.showReportsView}
            />;

        } else {

            content = this.renderReports();

        }

        // render content
        return <>{content}</>;

    }
}

export default Reports;