import React from 'react';
import DataTypeLabel from './DataTypeLabel';

//theme
import Theme from './../../themes/getStyle';

export default class extends React.PureComponent {
    render() {
        const type_name = 'bool';
        const { props } = this;

        return (
            <div {...Theme(props.theme, 'boolean')}>
                {props.value ? 'true' : 'false'}
                <DataTypeLabel type_name={type_name} {...props} />
            </div>
        );
    }
}
