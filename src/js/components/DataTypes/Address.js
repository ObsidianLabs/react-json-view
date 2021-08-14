import React from 'react';
import DataTypeLabel from './DataTypeLabel';

//theme
import Theme from './../../themes/getStyle';

export default class extends React.PureComponent {
    render() {
        const { props } = this;
        const { type, value, theme } = props;

        let label = null
        if (typeof props.getLabel === 'function') {
            label = props.getLabel(value)
            if (label) {
                label = (
                    <span className='badge badge-primary mr-1' {...Theme(theme, 'data-label')}>
                        {label}
                    </span>
                )
            }
        }

        return (
            <div {...Theme(props.theme, 'hex')}>
                <span className='link' onClick={() => props.onRedirect(`/account/${value}`)}>
                    {label}{value}
                </span>
                <DataTypeLabel type_name={type} {...props} />
            </div>
        );
    }
}
