/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import {connect} from 'react-redux'
import * as WidgetConfig from './widgetConfig'
import * as WidgetPlugins from './widgetPlugins'
import {deleteWidget} from './widgets'
import * as Widgets from './widgets'
import {PropTypes as Prop}  from "react";
import Dashboard from '../dashboard'

/**
 * The Dragable Frame of a Widget.
 * Contains generic UI controls, shared by all Widgets
 */
const WidgetFrame = (props) => {
    const widgetState = props.widget;

    // If the plugin is not in the registry, we assume it's currently loading
    const pluginLoaded = Dashboard.getInstance().widgetPluginRegistry.hasPlugin(widgetState.type)


    let widgetFactory;
    if (pluginLoaded) {
        widgetFactory = Dashboard.getInstance().widgetPluginRegistry.getPlugin(widgetState.type);
    }


    return (
        <div className="lob-shadow--raised slds-has-dividers--around"
             style={{margin: 0, overflow: "hidden"}}
             key={widgetState.id}
             _grid={{x: widgetState.col, y: widgetState.row, w: widgetState.width, h: widgetState.height}}>
            <div className="slds-grid slds-wrap slds-item">
                <div className={"slds-size--1-of-1 slds-tile slds-tile--board slds-has-dividers--bottom " + (props.isReadOnly ? "" : " drag")} style={{padding: 8}}>
                    {props.isReadOnly ? null :
                        <div className="slds-float--right">

                            <ConfigWidgetButton className="no-drag" widgetState={widgetState}
                                                visible={(props.widgetPlugin && props.widgetPlugin.typeInfo.settings ? true : false)}
                                                icon="settings"/>
                            {/* <!--<a className="right item drag">
                             <i className="move icon drag"></i>
                             </a>*/}
                            <DeleteWidgetButton className=" no-drag" widgetState={widgetState}
                                                icon="remove" iconType="action"/>


                        </div>
                    }
                    <div className={"" + (props.isReadOnly ? "" : " drag")}>
                        {widgetState.settings.name || "\u00a0"}
                    </div>
                </div>

                {/* Actual widget content*/}
                <div className="slds-size--1-of-1"
                     style={{height: widgetState.availableHeightPx, padding: 0, border: "red dashed 0px"}}>
                    {
                        pluginLoaded ? widgetFactory.getInstance(widgetState.id)
                            : <LoadingWidget widget={widgetState}/>
                    }
                </div>
            </div>
        </div>)
};

export const widgetPropType = Prop.shape({
    id: Prop.string.isRequired,
    col: Prop.number.isRequired,
    row: Prop.number.isRequired,
    width: Prop.number.isRequired,
    height: Prop.number.isRequired,
    settings: Prop.shape({
        name: Prop.string.isRequired
    }).isRequired
});

WidgetFrame.propTypes = {
    widget: widgetPropType.isRequired,
    widgetPlugin: WidgetPlugins.widgetPluginType.isRequired,
    isReadOnly: Prop.bool.isRequired
};


export default WidgetFrame;

const LoadingWidget = (props) => {
    return <div className="ui active text loader">Loading {props.widget.type} Widget ...</div>
};

LoadingWidget.propTypes = {
    widget: widgetPropType.isRequired
};

class WidgetButton extends React.Component {
    render() {
        const iconType = this.props.iconType || "utility"
        const data = this.props.widgetState;
        return <button className="slds-button slds-button--icon">
            <svg aria-hidden="true" className="slds-button__icon slds-button__icon--small"
                 onClick={() => this.props.onClick(data)}
            >
                <use xlinkHref={"/assets/icons/" + iconType + "-sprite/svg/symbols.svg#" + this.props.icon}></use>
            </svg>
            <span className="slds-assistive-text">Settings</span>
        </button>

        return <a className={this.props.className + (this.props.visible !== false ? "" : " hidden transition")}
                  onClick={() => this.props.onClick(data)}>
            <i className={this.props.icon + " icon"}></i>
        </a>
    }
}

WidgetButton.propTypes = {
    widgetState: widgetPropType.isRequired,
    icon: Prop.string.isRequired,
    iconType: Prop.string,
    visible: Prop.bool,
    className: Prop.string.isRequired,
    onClick: Prop.func.isRequired
};

const DeleteWidgetButton = connect(
    (state) => {
        return {}
    },
    (dispatch) => {
        return {
            onClick: (widgetState) => {
                dispatch(deleteWidget(widgetState.id))
            }
        };
    }
)(WidgetButton);

const ConfigWidgetButton = connect(
    (state) => {
        return {}
    },
    (dispatch) => {
        return {
            onClick: (widgetState) => {
                dispatch(WidgetConfig.openWidgetConfigDialog(widgetState.id))
            }
        };
    }
)(WidgetButton);
