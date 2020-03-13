import * as React from 'react';
import * as ReactDom from 'react-dom';
import HealthDashboard from "./components/global-dashboard/global-dashboard";
import LocalDashBoard from './components/local-dashboard/local-dashboard';

import "./index.scss"

const API_URL = "https://staywoke.lucy.servicedeskhq.com/hook/Covid19";

interface IProps {

}

interface IState {
    dashboard: string,
    title: string,
    userName: string
}

class Layout extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);

        this.state = {
            dashboard: "local",
            title: "Health Monitor",
            userName: 'User'
        };
    }

    

    render() {

        let content = <div></div>;

        if (this.state.dashboard == "global") {
            content = <HealthDashboard apiUrl={API_URL} basePath={"/"} />;
        }
        else {
            content = <LocalDashBoard  />;
        }

        return (
            <div className='root'>

                <div className='header'>
                    <a href='/' className='logo'></a>
                    <div className='title'>{this.state.title}</div>
                    <div className='padder'>
                        {this.state.userName == null ? "" : <><span className="great">Welcome</span> {this.state.userName}</> }
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