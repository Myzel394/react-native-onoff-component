import React, { ReactNode, createElement } from "react";
import { Button } from "react-native";

// Exports
export const PREFIX = "$";
export const BREAKER = "_";

export enum PROPS_PREFIXES {
    ON = "on",
    OFF = "off",
}

export interface Props {
    active: boolean;
    children?: ReactNode;
    component?: ReactNode;
    [key: string]: any;
}

// Interfaces
interface Changers {
    [key: string]: ChangersObject;
}

interface ChangersObject {
    [PROPS_PREFIXES.ON]: any;
    [PROPS_PREFIXES.OFF]: any;
}

interface DefaultProps {
    [key: string]: any;
}

// Constants
const BOOLEAN_STATES = {
    [true.toString()]: PROPS_PREFIXES.ON,
    [false.toString()]: PROPS_PREFIXES.OFF,
};

// Helpers
const ensureChangersObject = (changersObj: Changers, key: string): void => {
    const value = changersObj[key];

    if (value === undefined) {
        // @ts-ignore
        // Members will be add later
        changersObj[key] = {};
    }
};

const addToChangers = (
    changersObj: Changers,
    givenKey: string,
    givenValue,
): void => {
    let stateName: string;

    // Find prefix
    for (const name of Object.values(PROPS_PREFIXES)) {
        if (givenKey.startsWith(name)) {
            stateName = name;
        }
    }

    const key = givenKey.slice(stateName.length);

    ensureChangersObject(changersObj, key);

    changersObj[key][stateName] = givenValue;
};

const changersToProps = (
    changersObj: Changers,
    currentState: boolean,
): DefaultProps => {
    const useCurrentState = BOOLEAN_STATES[currentState.toString()];
    const found: DefaultProps = {};

    for (const [key, value] of Object.entries(changersObj)) {
        found[key] = value[useCurrentState];
    }

    return found;
};

// Components
export default function OnOffChanger(props: Props): ReactNode {
    const changers: Changers = {},
        newProps: DefaultProps = {};

    // Collect changers and props
    for (let [key, value] of Object.entries(props)) {
        if (key.startsWith(PREFIX)) {
            addToChangers(changers, key.slice(PREFIX.length), value);
        } else if (key.startsWith(BREAKER)) {
            // Prop should simply be passed
            newProps[key.slice(BREAKER.length)] = value;
        } else {
            newProps[key] = value;
        }
    }

    const { component, children, active, ...otherProps } = newProps;
    const changersProps = changersToProps(changers, active);

    return createElement(
        // @ts-ignore
        component,
        { ...otherProps, ...changersProps },
        children,
    );
}

OnOffChanger.defaultProps = {
    component: Button,
};
