import { safeLoad } from 'js-yaml';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import ReactPlayer from 'react-player';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import './index.scss';
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

interface IHealthDashboardProps {
    apiUrl:string;
    basePath:string;
}
interface IHealthDashboardState {

}


class MapWidget extends React.Component<{},{}> {
   
    render() {
        return <div className='gmap' >
<Map center={[45.4, -75.7]} zoom={12}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </Map>

        </div>;
    }
}
class HealthDashboard extends React.Component<IHealthDashboardProps,IHealthDashboardState> {
    constructor(props:IHealthDashboardProps) {
        super(props);
        this.state = {};
    }
    render() {
        return <div className='root'>
            <div className='header'>
                <div className='logo'></div>
                <div className='title'>Health Monitor</div>
                <div className='padder'></div>
            </div>
            <div className='toolbar'>

            </div>
            <div className='data-section'>

            <div className='stats'>
                <div className='stat confirmed'>
                    <div className='metric'>300</div>
                    <div className='title'>confirmed</div>
                </div>
                <div className='stat deaths'>
                    <div className='metric'>300</div>
                    <div className='title'>deaths</div>
                </div>
                <div className='stat deaths'>
                    <div className='metric'>300</div>
                    <div className='title'>deaths</div>
                </div>
            </div>
            <div className='data-list'></div>
            <div className='map'>
                <div className='map-widget'>
                    <MapWidget />
                </div>
            </div>
            </div>
        </div>
    }
} 

function renderDashboard(url: string,base:string) {

    ReactDom.render(
        <HealthDashboard apiUrl={url} basePath={base}  />,
        document.getElementById("root")
    );
}
renderDashboard("https://staywoke.lucy.servicedeskhq.com/hook/Covid19","/");