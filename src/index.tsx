import * as React from 'react';
import * as ReactDom from 'react-dom';
import HealthDashboard from "./components/global-dashboard/global-dashboard";
import LocalDashBoard from './components/local-dashboard/local-dashboard';

import "./index.scss"

const API_URL = "https://staywoke.lucy.servicedeskhq.com/hook/Covid19";
const Local_Data_URL = "https://staywoke.lucy.servicedeskhq.com/Lucy/SituationalAwareness/users/today"
const APIKey  = "SC:staywoke:f543c530b15de66a";

interface IProps {

}

interface IState {
    dashboard: string,
    title: any,
    userName: string
}

class Layout extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);

        this.state = {
            dashboard: "global",
            title: "Health Monitor",
            userName: null
        };

        this.toggleDashboard = this.toggleDashboard.bind(this);
    }

    componentDidMount() {
        
    }

    toggleDashboard() {
        if(this.state.dashboard == "global") {
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


    render() {

        let content = <div></div>;

        if (this.state.dashboard == "global") {
            content = <HealthDashboard apiUrl={API_URL} basePath={"/"} />;
        }
        else {
            content = <LocalDashBoard apiUrl={Local_Data_URL} apiKey={APIKey} basePath={"/"} />;
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

            }
            </div>
        );
    }
}

ReactDom.render(
    <Layout />,
    document.getElementById("root")
);