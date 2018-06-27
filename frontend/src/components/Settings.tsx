import React from "react";

import { Card, CardItem, Content, Icon, Text, StyleProvider, Button } from "native-base";
import { Image, View, StyleSheet, TouchableOpacity, Switch, Picker, Platform, ActionSheetIOS } from "react-native";


import { connect } from "react-redux";
import { IRootState } from "../redux/store";
import { changeSettings } from "../redux/actions/settings";
import { ISettings, ICoinPrice, IUser } from "../models";

import getTheme from '../../native-base-theme/components';
import commonColour from '../../native-base-theme/variables/commonColor';
import Config from "react-native-config";
import axios from "axios";

interface ISettingsProps {
    coins: ICoinPrice[];
    appSettings: ISettings;
    user: IUser;
    changeSettings: (settings: ISettings) => void;
}

class PureSettings extends React.Component<ISettingsProps>{
    public static navigatorStyle = {
        navBarTitleTextCentered: true,
        statusBarBlur: true,
        statusBarColor: "blue",
    };
    public styles: typeof styles;

    public constructor(props: ISettingsProps) {
        super(props);
    }
    public renderCryptoPicker() {
        const options = ["BTC", "ETH"]
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions({
                options: options,
            },
                (buttonIndex) => {
                    this.handleCryptoCurrencyValueChange(options[buttonIndex], buttonIndex);
                });
        }
        else {
            return (
                <Picker
                    selectedValue={this.props.appSettings.cryptoCurrency}
                    style={this.styles.picker}
                    onValueChange={this.handleCryptoCurrencyValueChange}
                >
                    {options.map((option: string, index: number) => <Picker.Item key={index} label={option} value={option} />)}
                </Picker>
            )
        }
    }
    public renderFiatPicker() {
        const options = ["USD", "EUR", "CAD", "GBP", "HKD"]
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions({
                options: options,
            },
                (buttonIndex) => {
                    this.handleFiatCurrencyValueChange(options[buttonIndex], buttonIndex);
                });
        }
        else {
            return (
                <Picker
                    selectedValue={this.props.appSettings.fiatCurrency}
                    style={this.styles.picker}
                    onValueChange={this.handleFiatCurrencyValueChange}
                >
                    {options.map((option: string, index: number) => <Picker.Item key={index} label={option} value={option} />)}
                </Picker>
            )
        }
    }

    public render() {
        this.styles = (this.props.appSettings.darkMode) ? darkStyles : styles;
        return (
            <StyleProvider style={getTheme(commonColour)}>
                <Content style={this.styles.Settings}>
                    <Card style={this.styles.Card}>
                        <TouchableOpacity>
                            <CardItem style={this.styles.CardItem}>
                                <View style={this.styles.CardLeft}>
                                    <Icon type="FontAwesome" name="dollar" style={this.styles.CardLeftIcon} />
                                    <Text style={this.styles.settingsText}>Preferred  Fiat Currency</Text>
                                </View>
                                {this.renderFiatPicker()}

                            </CardItem>
                        </TouchableOpacity>
                    </Card>
                    <Card style={this.styles.Card}>
                        <TouchableOpacity>
                            <CardItem style={this.styles.CardItem}>
                                <View style={this.styles.CardLeft}>
                                    {/* <Image source={require("../coin.png")} style={this.styles.CoinIcon} /> */}
                                    <Text style={this.styles.settingsText}>Preferred Crypto Currency</Text>
                                </View>
                                {this.renderCryptoPicker()}
                            </CardItem>
                        </TouchableOpacity>
                    </Card>
                    <Card style={this.styles.Card}>
                        <TouchableOpacity>
                            <CardItem style={this.styles.CardItem}>
                                <View style={this.styles.CardLeft}>
                                    <Icon type="FontAwesome" name="bell" style={this.styles.CardLeftIcon} />
                                    <Text style={this.styles.settingsText}>Push notifications</Text>
                                </View>
                                <View >
                                    <Switch value={this.props.appSettings.pushNotifications} onValueChange={this.handleNotificationChange.bind(this, this.props.user.token)} />
                                </View>
                            </CardItem>
                        </TouchableOpacity>
                    </Card>
                    <Card style={this.styles.Card}>
                        <TouchableOpacity>
                            <CardItem style={this.styles.CardItem}>
                                <View style={this.styles.CardLeft}>
                                    <Icon type="FontAwesome" name="moon-o" style={this.styles.CardLeftIcon} />
                                    <Text style={this.styles.settingsText}>Dark Mode</Text>
                                </View>
                                <View >
                                    <Switch value={this.props.appSettings.darkMode} onValueChange={this.handleDarkModeValueChange} />
                                </View>
                            </CardItem>
                        </TouchableOpacity>
                    </Card>
                    <Card style={this.styles.Card}>
                        <TouchableOpacity>
                            <CardItem style={this.styles.CardItem}>
                                <View style={this.styles.CardLeft}>
                                    <Icon type="FontAwesome" name="user" style={this.styles.CardLeftIcon} />
                                    <Text style={this.styles.settingsText}>Account</Text>
                                </View>
                            </CardItem>
                        </TouchableOpacity>
                    </Card>
                    <Card style={this.styles.Card}>
                        <TouchableOpacity>
                            <CardItem style={this.styles.CardItem}>
                                <View style={this.styles.CardLeft}>
                                    <Icon type="FontAwesome" name="info" style={this.styles.CardLeftIcon} />
                                    <Text style={this.styles.settingsText}>About</Text>
                                </View>
                            </CardItem>
                        </TouchableOpacity>
                    </Card>
                </Content>
            </StyleProvider>
        );
    }
    private handleCryptoCurrencyValueChange = (itemValue: string, itemIndex: number) => {
        const settings = { ...this.props.appSettings };
        settings.cryptoCurrency = itemValue;
        this.props.changeSettings(settings)
    }
    private handleDarkModeValueChange = () => {
        const settings = { ...this.props.appSettings };
        settings.darkMode = !settings.darkMode;
        this.props.changeSettings(settings)
    }
    private handleFiatCurrencyValueChange = (itemValue: string, itemIndex: number) => {
        const settings = { ...this.props.appSettings };
        settings.fiatCurrency = itemValue;
        this.props.changeSettings(settings)
    }
    private handleNotificationChange = (token: string) => {
        const settings = { ...this.props.appSettings };
        settings.pushNotifications = !settings.pushNotifications;
        this.props.changeSettings(settings)
        axios
            .patch(
                `${Config.API_SERVER}/user`,
                {
                    data: {
                        notifications: settings.pushNotifications
                    }
                },
                {
                    headers: {
                        token
                    }
                }
            )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        changeSettings: (settings: ISettings) => dispatch(changeSettings(settings)),
    };
};

const mapStateToProps = (state: IRootState) => {
    return {
        coins: state.coins.coins,
        appSettings: state.settings.settings,
        user: state.user.user,
    };
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(PureSettings);
export default Settings;

const styleTemplate = (darkMode: boolean) => StyleSheet.create({
    Card: {
        borderColor: (darkMode) ? "#41444c" : "#F8F8F8",
        backgroundColor: (darkMode) ? "#454951" : "#F8F8F8",
        margin: 10,
    },
    CardItem: {
        backgroundColor: (darkMode) ? "#454951" : "#F8F8F8",
        minHeight: 70,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    CardLeft: {
        // flex: 0.9,
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    CardLeftIcon: {
        color: (darkMode) ? "#F8F8F8" : "#000",
        marginRight: 15,
    },
    CoinIcon: {
        marginRight: 20,
        left: -4,
    },
    picker: {
        color: (darkMode) ? "#F8F8F8" : "#000",
        height: 50,
        width: 100
    },
    Settings: {
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: (darkMode) ? "#2f343f" : "#E1E1E1",
    },
    settingsText: {
        color: (darkMode) ? "#F8F8F8" : "#000",
    }
})

const styles = styleTemplate(false);
const darkStyles = styleTemplate(true);