import { Globals, MetroRain3 } from 'vizart-core';

const CartesianOptions = {
    color: {
        scheme: MetroRain3,
        type: Globals.ColorType.GRADIENT
    },
    chart: {
        margin: {
            left: 20,
            bottom: 20,
            right: 20,
            top: 20
        }
    },
    ordering: {
        accessor: null,
        direction: 'asc'
    },

    xAxis: {
        showTicks: true,
        allowDecimals: false,
        scale: null,
        ticks: 0,
        tickFormat: null,
        max: null,
        min: null,
        labelAngle: 0,

        title: {
            text: null,
            style: null,
            offset: 10
        }
    },

    yAxis: [
        {
            showTicks: true,
            allowDecimals: false,
            scale: null,
            max: null,
            min: null,
            ticks: 0,
            tier: 6,
            title: {
                text: null,
                style: null,
                offset: 10
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