import React from "react";

let Highcharts = require('highcharts/highstock');
let wbSocket = new WebSocket("wss://ws.coinapi.io/v1/");
let moment = require('moment');
let Database = require('./Database');
let config = require('../../../config');

export class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: {
                "BITSTAMP_SPOT_BTC_USD": {
                    title: 'BTC to USD',
                    price: 0,
                    uuid: ''
                },
                "BITSTAMP_SPOT_LTC_USD": {
                    title: 'LTC to USD',
                    price: 0,
                    uuid: ''
                },
                "BITSTAMP_SPOT_XRP_USD": {
                    title: 'XRP to USD',
                    price: 0,
                    uuid: ''
                }
            },
            status: false,
        };
    }

    drawChart(id, data = []) {
        const {currency} = this.state;
        const event = this;
        if (document.getElementById(id + '-chart')) {
            Highcharts.stockChart(id + '-chart', {
                chart: {
                    events: {
                        load: function () {
                            let series = this.series[0];
                            setInterval(function () {
                                const {currency} = event.state;
                                let x = moment().unix() * 1000, y = currency[id]['price'];
                                series.addPoint([x, y], true, true);
                            }, 5000);
                        }
                    }
                },
                title: {
                    text: currency[id]['title']
                },
                rangeSelector: {
                    buttons: [{
                        type: 'second',
                        count: 5,
                        text: 'Live'
                    }, {
                        type: 'minute',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'minute',
                        count: 60,
                        text: '1h'
                    }, {
                        type: 'day',
                        count: 1,
                        text: '1d'
                    }, {
                        type: 'week',
                        count: 1,
                        text: '1w'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1M'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    inputEnabled: true,
                    selected: 3
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 150,
                    maxZoom: 2 * 1000
                },
                series: [{
                    name: 'Price',
                    data: data,
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        }
    }

    componentWillMount() {
        const {currency} = this.state;
        const event = this;
        wbSocket.onopen = function () {
            wbSocket.send(JSON.stringify({
                "type": "hello",
                "apikey": config['COINAPI_KEY'],
                "heartbeat": false,
                "subscribe_data_type": ["trade"],
                "subscribe_filter_symbol_id": Object.keys(currency)
            }));
        };

        wbSocket.onclose = function () {
            console.log('Connection closed');
        };

    }

    componentDidMount() {
        const {currency, status} = this.state;
        let event = this;
        if (!status) {
            event.setState({status: true});
            Object.keys(currency).map(function (item) {
                Database.GetCreateDB(item);
                let all = Database.idbKeyval.getAll(item).then(all => {
                    all.sort(function (a, b) {
                        let a1 = a[0], b1 = b[0];
                        if (a1 === b1) return 0;
                        return a1 > b1 ? 1 : -1;
                    });
                    event.drawChart(item, all);
                });

            });
        }
        wbSocket.onmessage = function (evt) {
            let data = JSON.parse(evt.data);
            let states = Object.assign({}, event.state.currency);
            states[data['symbol_id']]['price'] = data['price'];
            states[data['symbol_id']]['uuid'] = data['uuid'];
            event.setState({states});
            Database.idbKeyval.set(data['symbol_id'], data['uuid'], [moment(data['time_coinapi']).unix() * 1000, data['price']]);
        };
    }

    // getCurrencyHistoryData(currency) {
    //     let currency_data = [moment().unix(), 0];
    //     fetch('https://rest.coinapi.io/v1/ohlcv/' + currency + '/latest?period_id=1HRS&limit=720',
    //         {
    //             headers: {
    //                 'X-CoinAPI-Key': '',
    //                 'content-type': 'application/json'
    //             },
    //         })
    //         .then(function (response) {
    //             if (response.ok && response.status === 200) {
    //                 response.json().reverse().map(function (item) {
    //                     currency_data.push([moment(item['time_open']).unix(), item['price_open']])
    //                 })
    //             }
    //             else {
    //                 currency_data.push()
    //             }
    //         })
    //         .catch(function (error) {
    //             alert(error)
    //         });
    //     return currency_data
    // };

    render() {
        const {currency} = this.state;
        let types = Object.keys(currency);
        return (
            <div className="row">
                <div className="col l12">
                    {types.map(function (item, index) {
                        return (
                            <div key={index} className="row card">
                                <div className="col l12">
                                    <div key={index} id={item + '-chart'}/>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
}