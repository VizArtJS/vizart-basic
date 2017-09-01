import { Globals, MetroRain3 } from 'vizart-core';

const CartesianOptions = {
    color: {
        scheme: MetroRain3,
        type: Globals.ColorType.GRADIENT
    },
    chart: {
        margin: {
            left: 60,
            bottom: 50,
            right: 10,
            top: 20
        }
    },
    ordering: {
        accessor: null,
        direction: 'asc'
    },

    xAxis: {
        allowDecimals: false,
        scale: null,
        ticks: 0,
        tickFormat: null,
        max: null,
        min: null,
        labelAngle: 0,

        title: {
            text: '',
            style: ''
        }
    },

    yAxis: [
        {
            allowDecimals: false,
            scale: null,
            max: null,
            min: null,
            ticks: 0,
            tier: 6,
            title: {
                text: '',
                style: ''
            }
        }
    ],

    data: {
        x: {
            accessor: null,
            type:  Globals.DataType.NUMBER,
            formatter: null,
        },
        y: [
            {
                accessor: null,
                type:  Globals.DataType.NUMBER,
                formatter:  null,
                yAxis: 0,
                tooltip: {
                    valueSuffix: null
                }
            }
        ]
    }

}

export default CartesianOptions;