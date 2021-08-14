import React from 'react';
import DataTypeLabel from './DataTypeLabel';
import { toType } from './../../helpers/util';

//theme
import Theme from './../../themes/getStyle';

//attribute store for storing collapsed state
import AttributeStore from './../../stores/ObjectAttributes';

export default class extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            format: props.value.utf8 ? 'utf8' : 'hex',
            collapsed: AttributeStore.get(
                props.rjvId,
                props.namespace,
                'collapsed',
                true
            )
        };
    }

    toggleFormat = () => {
      this.setState({ format: this.state.format === 'hex' ? 'utf8' : 'hex' })
    }

    toggleCollapsed = () => {
        this.setState(
            {
                collapsed: !this.state.collapsed
            },
            () => {
                AttributeStore.set(
                    this.props.rjvId,
                    this.props.namespace,
                    'collapsed',
                    this.state.collapsed
                );
            }
        );
    };

    render() {
        const { format, collapsed } = this.state;
        const { props } = this;
        const type_name = props.type;
        const { collapseStringsAfterLength, theme } = props;
        let value = props.value[format];
        let collapsible = toType(collapseStringsAfterLength) === 'integer';
        let style = { style: { cursor: 'default' } };

        if (typeof value === 'undefined') {
            value = <span className='badge badge-danger'>Invalid utf8</span>
        } else if (collapsible && value.length > collapseStringsAfterLength) {
            style.style.cursor = 'pointer';
            if (this.state.collapsed) {
                value = (
                    <span>
                        {value.substring(0, collapseStringsAfterLength)}
                        <span {...Theme(theme, 'ellipsis')}> ...</span>
                    </span>
                );
            }
        }

        if (format === 'utf8') {
            value = `"${value}"`
        }

        return (
            <div {...Theme(theme, format === 'utf8' ? 'string' : 'hex')}>
                <span
                    class="string-value"
                    {...style}
                    onClick={this.toggleCollapsed}
                >
                    {value}
                </span>
                <span
                    class="badge bg-secondary cursor-pointer data-type-label"
                    {...Theme(theme, 'data-type-label')}
                    onClick={this.toggleFormat}
                >
                    {type_name}|{format}
                </span>
            </div>
        );
    }
}
