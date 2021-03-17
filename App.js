import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Header, Input, Button, ListItem, Icon } from 'react-native-elements';
import { Keyboard } from 'react-native';

const db = SQLite.openDatabase('shoppingdb.db');

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [groceries, setGroceries] = useState([]);

  const initialFocus = useRef(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists shopping (id integer primary key not null, product text, amount text);');
    });
    updateList();
  }, []);

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('Select * from shopping;', [], (_, { rows }) =>
        setGroceries(rows._array)
      );
    });
  }

  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql('insert into shopping (product, amount) values (?, ?);', [product, String(amount)]);
    }, null, updateList)
    setProduct('');
    setAmount('');
    initialFocus.current.focus();
    Keyboard.dismiss();
  }

  const deleteItem = (id) => {
    db.transaction(
      tx => {
        tx.executeSql(`delete from shopping where id = ?;`, [id]);
      }, null, updateList)
  }

  renderItem = ({ item }) => (
    <View style={{ width: 300 }}>
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{item.product}</ListItem.Title>
        <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
      </ListItem.Content>
      <Icon type='material' name='delete' onPress={() => deleteItem(item.id)}/>
    </ListItem>
    </View>
  )

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'SHOPPING LIST', style: { color: '#fff', padding: 5 }}}
      />
      <Input 
        placeholder='Product'
        label='PRODUCT'
        ref={initialFocus}
        onChangeText={(product) => setProduct(product)}
        value={product}     
      />
      <Input
        placeholder='Amount'
        label='AMOUNT'
        onChangeText={(amount) => setAmount(amount)}
        value={amount}
      />
      <Button
        raised icon={{ name: 'save', color: 'white', size: 25 }}
        onPress={saveItem}
        title='SAVE'
        style={{ width: 200 }}
      />
      <FlatList
        data={groceries}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
