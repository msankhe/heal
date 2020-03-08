
export function shortenNumber(i:number):string {
    if (i < 1000) return ''+i;
    if (i < 10000) {
        return (( i / 1000.0).toFixed(1))+'K';
    }
    if (i <1000000) {
        return ( i / 1000).toFixed(0) + 'K';
    }
    return ( i / 1000000).toFixed(0) + 'M';
}


/**
 * Calculate the center/average of multiple GeoLocation coordinates
 * Expects an array of objects with .latitude and .longitude properties
 *
 * @url http://stackoverflow.com/a/14231286/538646
 * @url https://gist.github.com/tlhunter/0ea604b77775b3e7d7d25ea0f70a23eb
 */
export function averageGeolocation(coords: { lat: number, lon: number }[]):{lat:number,lon:number} {
    if (coords.length === 1) {
        return coords[0];
    }
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;
    for (let coord of coords) {
        let lat = coord.lat * Math.PI / 180;
        let lon = coord.lon * Math.PI / 180;
        x += Math.cos(lat) * Math.cos(lon);
        y += Math.cos(lat) * Math.sin(lon);
        z += Math.sin(lat);
    }
    let total = coords.length;
    x = x / total;
    y = y / total;
    z = z / total;
    let centrallon = Math.atan2(y, x);
    let centralSquareRoot = Math.sqrt(x * x + y * y);
    let centrallat = Math.atan2(z, centralSquareRoot);
    return {
        lat: centrallat * 180 / Math.PI,
        lon: centrallon * 180 / Math.PI
    };
}
