import { FieldType, DefaultCategoricalColor } from 'vizart-core';

const CartesianStackedOptions = {
    color: DefaultCategoricalColor,
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
            type:  FieldType.STRING,
            formatter: function () { }
        },
        x: {
            accessor: null,
            type:  FieldType.NUMBER,
            formatter: ()=> { }
        },
        y: [
            {
                accessor: null,
                type:  FieldType.NUMBER,
                formatter: function () { },
                yAxis: 0
            }
        ],
    }

}

export default CartesianStackedOptions;