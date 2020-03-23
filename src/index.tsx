import * as React from 'react';
import * as ReactDom from 'react-dom';
import HealthDashboard from "./components/global-dashboard/global-dashboard";
import LocalDashBoard from './components/local-dashboard/local-dashboard';

import "./index.scss"

const API_URL = "https://staywoke.lucy.servicedeskhq.com/hook/Covid19";
const Local_Data_URL = "https://staywoke.lucy.servicedeskhq.com"
const APIKey = "SC:staywoke:f543c530b15de66a";

interface IProps {

}

interface IState {
    dashboard: string,
    title: any,
    userName: string,
    dialog: 'info' | ''
}

class Layout extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);

        this.state = {
            dashboard: "global",
            title: "Health Monitor",
            userName: null,
            dialog: ""
        };

        this.toggleDashboard = this.toggleDashboard.bind(this);
        this.renderInfo = this.renderInfo.bind(this);
    }

    componentDidMount() {

    }

    toggleDashboard() {
        if (this.state.dashboard == "global") {
            this.setState({
                dashboard: "local",
                title: <span><span className="highlight">Employee </span> health management</span>,
                userName: "User 01"
            });
        }
        else {
            this.setState({
                dashboard: "global",
                title: "Health Monitor",
                userName: null
            });
        }
    }

    renderInfoDialog() {
        return <><div className='dialog-sheet' onClick={() => this.setState({ dialog: '' })} />
            <div className='dialog info'>
                <div className='header'>
                    <div className='first'></div>
                    <div className='title'>
                        Information
                        </div>
                    <div className='last'>

                        <div className='closer' onClick={() => this.setState({ dialog: '' })} />
                    </div>
                </div>
                <div className='body'>
                    <ol className='items'>
                        <li>
                            <div className='text'>WHO has information on how to keep yourself and your family safe. </div>
                            <div className='action-container'>
                                <a className='action' href='https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public' target='_blank'>View</a>
                            </div>
                        </li>
                        <li>
                            <div className='text'>
                                CFR (Case Fatality Rate) is calculated as percentage of fatalities in confirmed cases.
                                 </div>
                            <div className='action-container'>

                            </div>
                        </li>
                        <li>
                            <div className='text'>Data for this dashboard is sourced from several places, most notably, John Hopkins Center for System Science  and Engineering</div>
                            <div className='action-container'>
                                <a className='action' href='https://github.com/CSSEGISandData' target='_blank'>Source</a>
                            </div>
                        </li>
                        <li>
                            <div className='text'>The APIs for this dashboard are powered by Lucy using data culled from the sources mentioned above.</div>
                            <div className='action-container'>
                                <a className='action' href='https://lucyinthesky.io' target='_blank'>Learn More</a>
                            </div>
                        </li>
                        <li>
                            <div className='text'>The code for this dashboard is available on Github.</div>
                            <div className='action-container'>
                                <a className='action' href='https://github.com/lucy-platform/heal' target='_blank'>View on Github</a>
                            </div>
                        </li>
                    </ol>

                </div>
            </div>
        </>;
    }

    renderInfo() {
        this.setState({dialog: "info"});
    }

    render() {

        let content = <div></div>;

        if (this.state.dashboard == "global") {
            content = <HealthDashboard apiUrl={API_URL} basePath={"/"} renderInfo={this.renderInfo} />;
        }
        else {
            content = <LocalDashBoard apiUrl={Local_Data_URL} apiKey={APIKey} basePath={"/"} renderInfo={this.renderInfo} />;
        }

        return (
            <div className='root'>

                <div className='header'>
                    <a href='/' className='logo'></a>
                    <div className='title'>{this.state.title}</div>
                    <div className='padder'>
                        {this.state.userName == null ? "" : <><span className="great">Welcome</span> {this.state.userName}</>}
                    </div>


                </div>
                <div className="header-buttons">
                    <div className="toggle-button">
                        <span className={`label ${this.state.dashboard == "global" ? "global" : ""} `}>Global Dashboard</span>
                        <div className="range" onClick={this.toggleDashboard}>
                            <span className="rail"></span>
                            <span className={`slider ${this.state.dashboard} `}></span>
                        </div>
                        <span className={`label ${this.state.dashboard == "local" ? "local" : ""} `}>User Dashboard</span>
                    </div>
                </div>

                {content}

                {(this.state.dialog == 'info') ? this.renderInfoDialog() : null }

            </div>
        );
    }
}

ReactDom.render(
    <Layout />,
    document.getElementById("root")
);