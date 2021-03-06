import React, { RefObject } from "react";
import { connect } from "react-redux";

import { Text, StyleProvider, Spinner } from "native-base";
import { FlatList, View, RefreshControl, TextInput, Dimensions, } from "react-native";

import { ICoinPrice, IUser, ISettings } from "../models";
import { addCoinFavourite, removeCoinFavourite } from "../redux/actions/favourites";
import { IRootState } from "../redux/store";

import { styles } from "./styles/CoinsStyles";

import getTheme from '../../native-base-theme/components';
import commonColour from '../../native-base-theme/variables/commonColor';

import { getCoins } from "../redux/actions/coins";
import { Navigator } from "react-native-navigation";
import CoinListItem from "./CoinListItem";

const startingNumberOfCoins = 20;
interface ICoinListProps {
    coins: ICoinPrice[];
    favouriteTab: boolean;
    favourites: number[];
    appSettings: ISettings;
    setting: string,
    user: IUser,
    navigator: Navigator;
    addMissingFavourites: (favourites: ICoinPrice[]) => void;
    addCoinFavourite: (coinID: number, token: string) => void;
    removeCoinFavourite: (coinID: number, token: string) => void;
    sortCoins: () => void;
    setRef: RefObject<FlatList<ICoinPrice>>
}

export interface ICoinListState {
    coins: ICoinPrice[];
    numberOfCoins: number
    refreshing: boolean;
    missingAdded: boolean;
    // searching: boolean;
    // searchedCoins: ICoinPrice[];
    cryptoCurrencyName: string;
    fiatCurrencyName: string;
    // showCancel: boolean;
    // showSearch: boolean;
}
class PureCoinList extends React.Component<ICoinListProps, ICoinListState> {
    public windowHeight = Dimensions.get("window").height;
    public textInput: TextInput;
    public searchInput: string = "";
    // public offset = 0;
    public waitingForFetch = false;

    public currencySymbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        CAD: "$",
        GBP: "£",
        HKD: "$",
        // BTC: "&#xf15a",
        // ETH: "&#xf42e",
    }

    public constructor(props: ICoinListProps) {
        super(props);
        this.state = {
            refreshing: false,
            numberOfCoins: startingNumberOfCoins,
            coins: this.props.coins,
            missingAdded: false,
            // searching: false,
            // searchedCoins: [],
            cryptoCurrencyName: "BTC",
            // showCancel: false,
            // showSearch: true,
            fiatCurrencyName: "USD",
        };
    }
    public componentWillReceiveProps(nextProps: ICoinListProps) {
        this.setState({
            coins: nextProps.coins,
        })
    }
    public renderCoinList = (info: { item: ICoinPrice, index: number }) => {
        const favourite = this.props.favourites.indexOf(info.item.id) > -1;
        if (info.item.price_crypto.percent_change_1h === null || info.item.price_crypto.percent_change_24h === null || info.item.price_crypto.percent_change_7d === null || info.item.price_fiat.percent_change_1h === null || info.item.price_fiat.percent_change_24h === null || info.item.price_fiat.percent_change_7d === null) {
            return null
        };
        return (
            <CoinListItem key={info.item.id} item={info.item} favourite={favourite} navigator={this.props.navigator} setting={this.props.setting} />
        )
    }
    // public renderSearchBar() {
    //     if (this.state.showSearch) {
    //         return (
    //           
    //         )
    //     } else {
    //         return null
    //     }
    // }
    public render() {
        const favouriteCoins = this.state.coins.filter((coin: ICoinPrice) => this.props.favourites.indexOf(coin.id) > -1);
        // const missingFavourites = this.props.favourites.filter((favourite) => {
        //     let favouriteMissing = true
        //     favouriteCoins.forEach((coin) => {
        //         if (favourite === coin.id) {
        //             favouriteMissing = false
        //         }
        //     })
        //     return favouriteMissing
        // });
        // if (!this.state.missingAdded && this.state.coins.length > 0 && missingFavourites.length > 0) { this.addMissingCoins(missingFavourites) };
        const spinner = () => {
            return (
                <View style={styles(this.props.appSettings.darkMode).coinListComponent}>
                    <Spinner />
                </View>
            )
        }
        const noFavourites = () => {
            if (this.state.coins.length > 0) {
                return (
                    <View style={styles(this.props.appSettings.darkMode).coinListComponent}>
                        <Text style={styles(this.props.appSettings.darkMode).NoFavourites}>
                            You have no favourite coins! Click on the ⭐️ to add some favourites!
                        </Text>
                    </View>
                )
            } else {
                return spinner()
            }
        }
        const top200 = this.props.coins.filter((coin) => coin.rank < 200)

        return (
            <StyleProvider style={getTheme(commonColour)}>
                <View style={styles(this.props.appSettings.darkMode).coinListComponent}>
                    {/* tslint:disable-next-line:jsx-no-multiline-js */}
                    {
                        // (this.props.favouriteTab) ? null : (
                        //     this.renderSearchBar()
                        // )
                    }
                    {/* tslint:disable-next-line:jsx-no-multiline-js */}
                    {
                        (this.props.favouriteTab) ? (
                            <FlatList
                                data={favouriteCoins}
                                extraData={this.props.favourites}
                                renderItem={this.renderCoinList}
                                keyExtractor={this.keyExtractor}
                                style={styles(this.props.appSettings.darkMode).coinList}
                                getItemLayout={this.getItemLayout}
                                refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
                                // refreshControl={(Platform.OS === "ios") ? <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} /> : null}

                                ListEmptyComponent={noFavourites()}
                                // tslint:disable-next-line:jsx-no-multiline-js
                                ref={this.props.setRef}
                            />
                        ) : (
                                <FlatList
                                    data={(this.props.setting[0] === "0") ? this.props.coins.slice(0, this.state.numberOfCoins) : top200}
                                    extraData={this.props.favourites}
                                    initialNumToRender={20}
                                    renderItem={this.renderCoinList}
                                    keyExtractor={this.keyExtractor}
                                    style={[styles(this.props.appSettings.darkMode).coinList,]}
                                    getItemLayout={this.getItemLayout}
                                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}

                                    // refreshControl={(Platform.OS === "ios") ? <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} /> : null}
                                    onEndReached={this.endReached}
                                    onEndReachedThreshold={0.5}
                                    // onScroll={this.onScroll}
                                    // scrollEnabled={!this.state.searching}
                                    ListEmptyComponent={spinner()}
                                    ref={this.props.setRef}
                                    ListFooterComponent={(this.props.setting[0] === "0") ? (this.props.coins.length > 0) ? spinner() : null : null}
                                />
                            )
                    }
                </View>
            </StyleProvider>
        );

    }
    // public addMissingCoins = (coins: number[]) => {
    //     coins.forEach((favourite) => {
    //         this.props.coins.forEach((coin) => {
    //             if (coin.id === favourite) {
    //                 return
    //             }
    //         })
    //     })
    //     Promise.all(coins.map((favourite) => {
    //         return axios
    //             .get<ICoinPrice>(`${Config.API_SERVER}/price/${favourite}`, {
    //                 headers: {
    //                     token: this.props.user.token,
    //                     fiat: this.state.fiatCurrencyName,
    //                     crypto: this.state.cryptoCurrencyName
    //                 }
    //             })
    //             .then((response) => {
    //                 if (typeof response.data.id === "undefined") {
    //                     return null
    //                 } else {
    //                     return response.data
    //                 }
    //             })
    //     })
    //     ).then((favourites) => {
    //         this.props.addMissingFavourites(favourites);
    //         this.setState({ missingAdded: true })
    //     })
    // }

    private endReached = () => {

        if (!this.waitingForFetch) {
            this.waitingForFetch = true;

            const newNumberOfCoins = this.state.numberOfCoins + 20;
            // getCoins(this.props.appSettings, this.state.numberOfCoins, 100).then(() => {
            //     this.setState({
            //         numberOfCoins: newNumberOfCoins,
            //     });
            //     this.waitingForFetch = false;
            // })
            this.setState({
                numberOfCoins: newNumberOfCoins,
            });
            this.waitingForFetch = false;
        }
    }
    private getItemLayout = (data: any, index: number) => ({ length: 71, offset: 71 * index, index });
    private keyExtractor = (item: ICoinPrice) => item.id.toString();

    // private onNavigatorEvent = (event: any) => {
    //     // if (event.id === 'bottomTabSelected') {

    //     // }
    //     if (event.id === 'bottomTabReselected') {
    //         if (typeof this.flatListFavourite !== "undefined" && this.state.coins.length > 0 && this.props.favouriteTab) {
    //             this.flatListFavourite.scrollToIndex({ index: 0, viewOffset: 0, viewPosition: 0, animated: true });
    //         }
    //         else if (typeof this.flatListMarket !== "undefined" && this.props.coins.length > 0) {
    //             this.flatListMarket.scrollToIndex({ index: 0, viewOffset: 0, viewPosition: 0, animated: true });
    //         }
    //     }
    // }
    private onRefresh = () => {
        // const newNumberOfCoins = this.state.numberOfCoins + 100;
        this.setState({
            refreshing: true
        });
        getCoins(this.props.appSettings, 0, 2000).then(() => {
            this.props.sortCoins();
            this.setState({
                // numberOfCoins: newNumberOfCoins,    // COMMENT : should be calculated with this.propw.coins.length()
                refreshing: false
            });
        });
    }

}

const mapDispatchToProps = (dispatch: any) => {
    return {
        addCoinFavourite: (coinID: number, token: string) => dispatch(addCoinFavourite(coinID, token)),
        removeCoinFavourite: (coinID: number, token: string) => dispatch(removeCoinFavourite(coinID, token)),
    };
};

const mapStateToProps = (state: IRootState) => {
    return {
        favourites: state.favourites.favourites,
        appSettings: state.settings.settings,
    };
};

const CoinList = connect(mapStateToProps, mapDispatchToProps)(PureCoinList);
export default CoinList;