import React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import { toType } from './../../helpers/util';

//data type components
import { JsonObject } from './DataTypes';

import VariableEditor from './../VariableEditor';
import { ObjectSize } from './../VariableMeta';
import CopyToClipboard from './../CopyToClipboard';

import ArrayGroup from './../ArrayGroup';
import ObjectName from './../ObjectName';

//attribute store
import AttributeStore from './../../stores/ObjectAttributes';

//icons
import { CollapsedIcon, ExpandedIcon } from './../ToggleIcons';

//theme
import Theme from './../../themes/getStyle';

//increment 1 with each nested object & array
const DEPTH_INCREMENT = 1;
//single indent is 5px
const SINGLE_INDENT = 5;

class RjvObject extends React.PureComponent {
    constructor(props) {
        super(props);
        const state = RjvObject.getState(props);
        this.state = {
            ...state,
            prevProps: {}
        };
    }

    static getState = props => {
        const size = Object.keys(props.src).length;
        const expanded =
            (props.collapsed === false ||
                (props.collapsed !== true && props.collapsed > props.depth)) &&
            (!props.shouldCollapse ||
                props.shouldCollapse({
                    name: props.name,
                    src: props.src,
                    type: toType(props.src),
                    namespace: props.namespace
                }) === false) &&
            //initialize closed if object has no items
            size !== 0;
        const state = {
            expanded: AttributeStore.get(
                props.rjvId,
                props.namespace,
                'expanded',
                expanded
            ),
            object_type: props.type === 'array' ? 'array' : 'object',
            parent_type: props.type === 'array' ? 'array' : 'object',
            size,
            hovered: false
        };
        return state;
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const { prevProps } = prevState;
        if (
            nextProps.src !== prevProps.src ||
            nextProps.collapsed !== prevProps.collapsed ||
            nextProps.name !== prevProps.name ||
            nextProps.namespace !== prevProps.namespace ||
            nextProps.rjvId !== prevProps.rjvId
        ) {
            const newState = RjvObject.getState(nextProps);
            return {
                ...newState,
                prevProps: nextProps
            };
        }
        return null;
    }

    toggleCollapsed = () => {
        this.setState(
            {
                expanded: !this.state.expanded
            },
            () => {
                AttributeStore.set(
                    this.props.rjvId,
                    this.props.namespace,
                    'expanded',
                    this.state.expanded
                );
            }
        );
    };

    getObjectContent = (depth, src, props) => {
        return (
            <div class="pushed-content object-container">
                <div
                    class="object-content"
                    {...Theme(this.props.theme, 'pushed-content')}
                >
                    {this.renderObjectContents(src, props)}
                </div>
            </div>
        );
    };

    getEllipsis = text => {
        const { size } = this.state;

        if (size === 0) {
            //don't render an ellipsis when an object has no items
            return null;
        } else {
            return (
                <div
                    {...Theme(this.props.theme, 'ellipsis')}
                    class="node-ellipsis mouse-cursor"
                    key="collapsed"
                    onClick={this.toggleCollapsed}
                >
                    {text}
                </div>
            );
        }
    };

    getObjectSize = () => {
        const { size } = this.state;
        return (
            <ObjectSize size={size} {...this.props} />
        );
    };

    getCopyToClipboard = () => {
        const { enableClipboard, src, theme, namespace } = this.props;
        const { hovered } = this.state;
        return (
            <div
                {...Theme(theme, 'object-meta-data')}
                class="object-meta-data"
                onClick={e => {
                    e.stopPropagation();
                }}
            >
                <CopyToClipboard
                    rowHovered={hovered}
                    clickCallback={enableClipboard}
                    {...{ src, theme, namespace }}
                />
            </div>
        )
    };

    getBraceStart(object_type, expanded) {
        const { src, theme, iconStyle, parent_type } = this.props;

        if (parent_type === 'array_group') {
            return (
                <span>
                    <span {...Theme(theme, 'brace')}>
                        {object_type === 'array' ? '[' : '{'}
                    </span>
                    {expanded ? this.getObjectSize() : null}
                </span>
            );
        }

        const IconComponent = expanded ? ExpandedIcon : CollapsedIcon;

        return (
            <span>
                <span
                    onClick={e => {
                        this.toggleCollapsed();
                    }}
                    {...Theme(theme, 'brace-row')}
                >
                    {/* <div
                        class="icon-container"
                        {...Theme(theme, 'icon-container')}
                    >
                        <IconComponent {...{ theme, iconStyle }} />
                    </div> */}
                    <ObjectName {...this.props} />
                    <span {...Theme(theme, 'brace')}>
                        {parent_type ? object_type === 'array' ? '[' : '{' : '('}
                    </span>
                </span>
                {expanded ? this.getObjectSize() : null}
            </span>
        );
    }

    render() {
        // `indentWidth` and `collapsed` props will
        // perpetuate to children via `...rest`
        const {
            depth,
            src,
            namespace,
            name,
            type,
            internal_type,
            parent_type,
            theme,
            jsvRoot,
            iconStyle,
            ...rest
        } = this.props;

        const { object_type, expanded } = this.state;

        let styles = {};
        if (!jsvRoot && parent_type !== 'array_group') {
            styles.paddingLeft = this.props.indentWidth * SINGLE_INDENT;
        } else if (parent_type === 'array_group') {
            styles.borderLeft = 0;
            styles.display = 'inline';
        }

        return (
            <div
                class="object-key-val"
                onMouseEnter={() =>
                    this.setState({ ...this.state, hovered: true })
                }
                onMouseLeave={() =>
                    this.setState({ ...this.state, hovered: false })
                }
                {...Theme(theme, jsvRoot ? 'jsv-root' : 'objectKeyVal', styles)}
            >
                {this.getBraceStart(object_type, expanded)}
                {expanded
                    ? this.getObjectContent(depth, src, {
                          theme,
                          iconStyle,
                          ...rest
                      })
                    : this.getEllipsis(this.getObjectSize())}
                <span class="brace-row">
                    <span
                        style={{
                            ...Theme(theme, 'brace').style,
                            paddingLeft: expanded ? '3px' : '0px'
                        }}
                    >
                        {parent_type ? object_type === 'array' ? ']' : '}' : ')'}
                    </span>
                    <span
                        class="badge bg-secondary text-muted data-type-label"
                        {...Theme(theme, 'data-type-label')}
                    >
                        {internal_type}
                    </span>
                    {this.getCopyToClipboard()}
                </span>
            </div>
        );
    }

    renderObjectContents = (src, props) => {
        const {
            depth,
            parent_type,
            index_offset,
            groupArraysAfterLength,
            namespace
        } = this.props;
        const { object_type } = this.state;
        let elements = [],
            variable;
        
        if (src.type) {
            variable = new JsonVariable(src.name, src.value, src.type, src.internalType);

            if (src.type.endsWith(']')) {
                let ObjectComponent = JsonObject;

                if (
                    groupArraysAfterLength &&
                    variable.value.length >= groupArraysAfterLength
                ) {
                    ObjectComponent = ArrayGroup;
                }

                elements.push(
                    <ObjectComponent
                        key={variable.name}
                        depth={depth + DEPTH_INCREMENT}
                        name={variable.name}
                        src={variable.value}
                        namespace={namespace.concat(variable.name)}
                        type="array"
                        parent_type={object_type}
                        internal_type={variable.internalType}
                        {...props}
                    />
                )
            } else if (!src.type.startsWith('tuple')) {
                elements.push(
                    <VariableEditor
                        key={variable.name + '_' + namespace}
                        variable={variable}
                        singleIndent={SINGLE_INDENT}
                        namespace={namespace}
                        type={this.props.type}
                        {...props}
                    />
                );
            }
            return elements
        }

        let keys = Object.keys(src || {});
        if (this.props.sortKeys && object_type !== 'array') {
            keys = keys.sort();
        }

        keys.forEach(name => {
            variable = new JsonVariable(name, src[name].value, src[name].type, src[name].internalType);

            if (parent_type === 'array_group' && index_offset) {
                variable.name = parseInt(variable.name) + index_offset;
            }
            if (!src.hasOwnProperty(name)) {
                return;
            } else if (variable.type === 'object' || variable.type === 'tuple') {
                elements.push(
                    <JsonObject
                        key={variable.name}
                        depth={depth + DEPTH_INCREMENT}
                        name={variable.name}
                        src={variable.value}
                        namespace={namespace.concat(variable.name)}
                        parent_type={object_type}
                        internal_type={variable.internalType}
                        {...props}
                    />
                );
            } else if (variable.type.endsWith(']')) {
                let ObjectComponent = JsonObject;

                if (
                    groupArraysAfterLength &&
                    variable.value.length >= groupArraysAfterLength
                ) {
                    ObjectComponent = ArrayGroup;
                }

                elements.push(
                    <ObjectComponent
                        key={variable.name}
                        depth={depth + DEPTH_INCREMENT}
                        name={variable.name}
                        src={variable.value}
                        namespace={namespace.concat(variable.name)}
                        type="array"
                        parent_type={object_type}
                        internal_type={variable.internalType}
                        {...props}
                    />
                );
            } else {
                elements.push(
                    <VariableEditor
                        key={variable.name + '_' + namespace}
                        variable={variable}
                        singleIndent={SINGLE_INDENT}
                        namespace={namespace}
                        type={this.props.type}
                        {...props}
                    />
                );
            }
        });

        return elements;
    };
}

//just store name, value and type with a variable
class JsonVariable {
    constructor(name, value, type, internalType) {
        this.name = name;
        this.value = value;
        this.type = type || toType(value);
        this.internalType = internalType;
    }
}

polyfill(RjvObject);

//export component
export default RjvObject;
