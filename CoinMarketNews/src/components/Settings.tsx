import React from 'react';

import { Container, Button, Text, Footer, FooterTab, Content, Icon, Header, Card, CardItem, Right } from 'native-base';

export default class Settings extends React.Component {
    render() {
        return (
            <Content>
                <Card>
                    <CardItem>
                        <Icon active name="logo-googleplus" />
                        <Text>Settings</Text>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </CardItem>
                </Card>
            </Content>
        );
    }
}