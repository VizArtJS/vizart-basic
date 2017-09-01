import { Globals, MetroRain8 } from 'vizart-core';

const CartesianStackedOptions = {
    chart: {
        margin: {
            left: 60,
            bottom: 50,
            right: 10,
            top: 20
        }
    },
    color: {
        scheme: MetroRain8,
        type: Globals.ColorType.CATEGORICAL
    },
    ordering: {
        accessor: null,
        direction: 'asc'
    },

    series: {
        allowDecimals: false,
        scale: null,
        max: null,
        min: null,
        ticks: 0,
        title: {
            text: '',
            style: ''
        }
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
            title: {
                text: '',
                style: ''
            }
        }
    ],

    data: {
        s: {
            accessor: null,
            type:  Globals.DataType.STRING,
            formatter: function () { }
        },
        x: {
            accessor: null,
            type:  Globals.DataType.STRING,
            formatter: ()=> { }
        },
        y: [
            {
                accessor: null,
                type:  Globals.DataType.NUMBER,
                formatter: function () { },
                yAxis: 0
            }
        ],
    }

}

export default CartesianStackedOptions;