import * as React from 'react';
interface IEmployeeStatusProps {
    apiUrl: string,
    apiKey: string,
    goBack: () => void;
}

interface IEmployeeStatusState {
    searchText: string;
    tempSearchText: string;
    mode: '' | 'office' | 'remote' | 'leave' | 'search';
    loadingStats: boolean;
    officeCount: number;
    leaveCount: number;
    remoteCount: number;

}
export class EmployeeStatus extends React.Component<IEmployeeStatusProps, IEmployeeStatusState> {
    constructor(props: IEmployeeStatusProps) {
        super(props);
        this.state = {
            searchText: '',
            tempSearchText: '',
            mode: '',
            loadingStats: false,
            leaveCount: 0,
            remoteCount: 0,
            officeCount: 0,
        }
    }

    componentDidMount() {
        this.loadStats().then(_ => { }).catch(e => console.error(e));
    }

    async setStateAsync(state: any) {
        return new Promise((ok, nope) => {
            this.setState(state, () => ok());
        });
    }
    async loadStats() {
        await this.setStateAsync({ loadingStats: true });
        let response = await fetch(this.props.apiUrl + '/Lucy/UserStatus/stats', {
            method: 'GET',
            headers: {
                'Authorization': `APIKEY ${this.props.apiKey}`
            }
        });
        let json = await response.json();
        this.setState({ loadingStats: false, officeCount: json.office, remoteCount: json.remote, leaveCount: json.leave });
    }
    renderStats() {
        let leaveCount: string = this.state.leaveCount + '';
        let officeCount: string = this.state.officeCount + '';
        let remoteCount: string = this.state.remoteCount + '';

        if (this.state.loadingStats) {
            leaveCount = '...';
            remoteCount = '...';
            officeCount = '...';
        }
        return (<>
            <div className={`back-button-container`}>
                <div className="back-button" onClick={() => this.props.goBack()}>Reports Home</div>
            </div>

            <div className='e-stats'>
                <div onClick={this.loadStats.bind(this, 'office')} className='stat office'>
                    <div className='bg' />
                    <div className='title'>Office</div>
                    <div className='value'>{officeCount}</div>
                </div>
                <div onClick={this.loadStats.bind(this, 'remote')} className='stat remote'>
                    <div className='bg' />
                    <div className='title'>Remote</div>
                    <div className='value'>{remoteCount}</div>
                </div>
                <div onClick={this.loadStats.bind(this, 'leave')} className='stat leave'>
                    <div className='bg' />
                    <div className='title'>Leave</div>
                    <div className='value'>{leaveCount}</div>
                </div>
            </div>
        </>);
    }
    renderFilteredUsers() {
        return <div></div>;
    }
    render() {

        return (
            <div className="report-section">
                <div className="report-container">

                    <div className="header">
                        <div className="title"><span className={`arrow`}></span>Employee Status</div>
                    </div>

                    <div className="body">

                        {
                            this.state.mode == "" ? this.renderStats() : this.renderFilteredUsers()
                        }

                    </div>

                </div>
            </div>

        );
    }
}