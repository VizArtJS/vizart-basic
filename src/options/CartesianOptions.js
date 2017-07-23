import { FieldType, DefaultSequentialColor } from 'vizart-core';

const CartesianOptions = {
    color: DefaultSequentialColor,
    chart: {
        margin: {
            left: 30,
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
            type:  FieldType.NUMBER,
            formatter: null,
        },
        y: [
            {
                accessor: null,
                type:  FieldType.NUMBER,
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