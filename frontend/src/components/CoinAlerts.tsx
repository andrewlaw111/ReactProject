import React from "react";
import { connect } from "react-redux";

import { Container, Text, StyleProvider, Icon, Left } from "native-base";
import { View, Switch, FlatList, ScrollView, PanResponder, TouchableOpacity } from "react-native";

import getTheme from '../../native-base-theme/components';
import commonColour from '../../native-base-theme/variables/commonColor';

import { ICoin, ICoinPrice, ISettings, IAlerts, IUser, INewsAlert } from "../models";
import { IRootState } from "../redux/store";
import { Navigator } from "react-native-navigation";
import CoinAlertsModal from "./CoinAlertsModal";
import { editAlert, removeAlerts, addNewsAlert, removeNewsAlert } from "../redux/actions/alerts";
import styles from "./styles/CoinAlertsStyles";

interface ICoinsAlertsProps {
    alerts: IAlerts[];
    appSettings: ISettings;
    coin: ICoin;
    coinPrice: ICoinPrice;
    darkMode: boolean;
    navigator: Navigator;
    newsAlerts: INewsAlert[];
    user: IUser;
    addNewsAlert: (coinID: number, token: string) => void;
    removeNewsAlert: (coinID: number, token: string) => void;
    editAlert: (alert: IAlerts, token: string) => void;
    removeAlerts: (alert: IAlerts, token: string) => void;
}
interface ICoinsAlertsState {
    alerts: IAlerts[];
    modalVisible: boolean
    newsAlerts: boolean;
}
class PureCoinAlerts extends React.Component<ICoinsAlertsProps, ICoinsAlertsState> {

    public currencySymbols: { [key: string]: string } = {
        USD: <Text style={{ color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>$</Text>,
        EUR: <Text style={{ color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>€</Text>,
        CAD: <Text style={{ color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>$</Text>,
        GBP: <Text style={{ color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>£</Text>,
        HKD: <Text style={{ color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>$</Text>,
        BTC: <Text style={{ fontFamily: "Font Awesome 5 Brands", color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>&#xf15a;</Text>,
        ETH: <Text style={{ fontFamily: "Font Awesome 5 Brands", color: (this.props.appSettings.darkMode) ? "#C2C2C2" : "#5E5E5E" }}>&#xf42e;</Text>,
    }

    constructor(props: ICoinsAlertsProps) {
        super(props);
        this.state = {
            alerts: this.props.alerts.filter((alert) => alert.coinmarketcap_id === this.props.coin.coinmarketcap_id),
            modalVisible: false,
            newsAlerts: (this.props.newsAlerts.map((alerts) => alerts.coin_id).indexOf(this.props.coin.id) > -1) ? true : false,
        };
    }
    componentWillReceiveProps(nextProps: ICoinsAlertsProps) {
        const alerts = nextProps.alerts.filter((alert) => alert.coinmarketcap_id === this.props.coin.coinmarketcap_id)
        this.setState({
            alerts
        })
        if (nextProps.newsAlerts.map((alerts) => alerts.coin_id).indexOf(this.props.coin.id) > -1) {
            this.setState({
                newsAlerts: true
            })
        } else {
            this.setState({
                newsAlerts: false
            })
        }
    }
    public renderAlerts = (info: { item: IAlerts, index: number }) => {
        return (
            <View style={styles(this.props.darkMode).NewsAlertsView}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles(this.props.darkMode).text}>{this.props.coin.symbol} {(info.item.upper) ? '>' : '<'} {info.item.price_point} </Text>
                    {this.currencySymbols[info.item.currency_symbol]}
                </View>
                <Switch value={info.item.active} onValueChange={this.handleValueChange.bind(this, info.item)} />
                <Icon type="FontAwesome" name="trash-o" onPress={this.handleDelete.bind(this, info.item)} />
            </View>
        )
    }
    public render() {
        return (
            <StyleProvider style={getTheme(commonColour)} >
                <Container style={styles(this.props.darkMode).alertsPage}>
                    <View style={styles(this.props.darkMode).NewsAlertsView}>
                        <Text style={styles(this.props.darkMode).text}>Receive news alerts about {this.props.coin.name}</Text>
                        <Switch value={this.state.newsAlerts} onValueChange={this.handlenewsAlertChange} />
                    </View>
                    <ScrollView>
                        <FlatList
                            data={this.state.alerts}
                            keyExtractor={this.keyExtractor}
                            renderItem={this.renderAlerts}
                        />
                    </ScrollView>
                    <CoinAlertsModal appSettings={this.props.appSettings} closeModal={this.closeModal} coinPrice={this.props.coinPrice} darkMode={this.props.darkMode} modalVisible={this.state.modalVisible} />
                </Container>
            </StyleProvider>
        );
    }
    private closeModal = () => {
        this.setState({
            modalVisible: false
        })
    }
    private keyExtractor = (item: IAlerts, index: number) => {
        return item.id.toString();
    }
    private handleDelete = (alert: IAlerts) => {
        return this.props.removeAlerts(alert, this.props.user.token)
    }
    private handlenewsAlertChange = () => {
        if (this.state.newsAlerts) {
            this.props.removeNewsAlert(this.props.coin.id, this.props.user.token)
            this.setState({
                newsAlerts: false
            })
        } else {

            this.props.addNewsAlert(this.props.coin.id, this.props.user.token)
            this.setState({
                newsAlerts: true
            })
        }
    }
    private handleValueChange = (alert: IAlerts) => {
        alert.active = !alert.active
        return this.props.editAlert(alert, this.props.user.token)
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        addNewsAlert: (coinID: number, token: string) => dispatch(addNewsAlert(coinID, token)),
        removeNewsAlert: (coinID: number, token: string) => dispatch(removeNewsAlert(coinID, token)),
        editAlert: (alert: IAlerts, token: string) => dispatch(editAlert(alert, token)),
        removeAlerts: (alert: IAlerts, token: string) => dispatch(removeAlerts(alert, token)),
    };
};
const mapStateToProps = (state: IRootState) => {
    return {
        alerts: state.alerts.priceAlerts,
        coins: state.coins.coins,
        newsAlerts: state.alerts.newsAlerts,
        user: state.user.user,
    };
};

const CoinAlerts = connect(mapStateToProps, mapDispatchToProps)(PureCoinAlerts);
export default CoinAlerts;
