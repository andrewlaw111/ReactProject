import React from "react";

import { Button, Col, Grid, Segment, Text } from "native-base";

import { Platform } from "react-native";
import { ISettings } from "../../models";
import styles from "../../styles/CoinOptions";

interface ICoinOptionsProps {
    appSettings: ISettings;
    settings: string;
    handleOptionsPress: (options: string) => void;
}

export default class CoinOptions extends React.PureComponent<ICoinOptionsProps> {
    public render() {
        interface IOptionsButton {
            active: boolean;
            first: boolean;
            handler: string;
            last: boolean;
            text: string;
        }

        const leftButtons: IOptionsButton[] = [{
            active: this.props.settings[0] === "0",
            first: true,
            handler: "Cap",
            last: false,
            text: "Cap",
        }, {
            active: this.props.settings[0] === "1",
            first: false,
            handler: "Gain",
            last: false,
            text: "Gain",
        }, {
            active: this.props.settings[0] === "2",
            first: false,
            handler: "Drop",
            last: true,
            text: "Drop",
        }];

        const middleButtons: IOptionsButton[] = [{
            active: this.props.settings[1] === "0",
            first: true,
            handler: "Fiat",
            last: false,
            text: this.props.appSettings.fiatCurrency,
        }, {
            active: this.props.settings[1] === "1",
            first: false,
            handler: "Crypto",
            last: true,
            text: this.props.appSettings.cryptoCurrency,
        }];
        const rightButtons: IOptionsButton[] = [{
            active: this.props.settings[2] === "0",
            first: true,
            handler: "oneWeek",
            last: false,
            text: "1W",
        }, {
            active: this.props.settings[2] === "1",
            first: false,
            handler: "oneDay",
            last: false,
            text: "1D",
        }, {
            active: this.props.settings[2] === "2",
            first: false,
            handler: "oneHour",
            last: true,
            text: "1H",
        }];

        const buttonTemplate = (button: IOptionsButton, index: number) => {
            if (Platform.OS === "ios") {
                return (
                    <Button
                        style={{ paddingLeft: 5, paddingRight: 5 }}
                        first={button.first}
                        last={button.last}
                        active={button.active}
                        onPress={this.handlePress.bind(this, button.handler)}
                        key={index}
                    >
                        <Text style={{ paddingLeft: 0, paddingRight: 0 }}>
                            {button.text}
                        </Text>
                    </Button>
                );
            } else {
                return (
                    <Button
                        style={styles(this.props.appSettings.darkMode, button.active).buttons}
                        first={button.first}
                        last={button.last}
                        onPress={this.handlePress.bind(this, button.handler)}
                        key={index}
                    >
                        <Text style={styles(this.props.appSettings.darkMode, button.active).buttonText}>
                            {button.text}
                        </Text>
                    </Button>
                );
            }
        };
        return (
            <Grid style={styles(this.props.appSettings.darkMode).gridStyle} >
                <Col style={{ flex: 0.4 }}>
                    <Segment style={styles(this.props.appSettings.darkMode).coinListFilters}>
                        {leftButtons.map((button, index) => buttonTemplate(button, index))}
                    </Segment>
                </Col>
                <Col style={{ flex: 0.25 }}>
                    <Segment style={styles(this.props.appSettings.darkMode).coinListFilters}>
                        {middleButtons.map((button, index) => buttonTemplate(button, index))}
                    </Segment>
                </Col>
                <Col style={{ flex: 0.35 }}>
                    <Segment style={styles(this.props.appSettings.darkMode).coinListFilters}>
                        {rightButtons.map((button, index) => buttonTemplate(button, index))}
                    </Segment>
                </Col>
            </Grid >
        );
    }
    private handlePress = (options: string) => {
        this.props.handleOptionsPress(options);
    }
}
