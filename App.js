import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

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
  }

  const deleteItem = (id) => {
    db.transaction(
      tx => {
        tx.executeSql(`delete from shopping where id = ?;`, [id]);
      }, null, updateList)
  }

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '80%',
          backgroundColor: '#CED0CE',
          marginLeft: '10%'
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder='Product'
        ref={initialFocus}
        style={{marginTop: 30, fontSize: 18, width: 200, padding: 5, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(product) => setProduct(product)}
        value={product}
      />
      <TextInput
        placeholder='Amount'
        style={{marginTop: 20, marginBottom: 20, fontSize: 18, width: 200, padding: 5, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(amount) => setAmount(amount)}
        value={amount}
      />
      <Button onPress={saveItem} title='Save'/>
      <FlatList
        ListHeaderComponent={() => <Text style={{fontSize: 20, marginTop: 20, marginBottom: 5, alignSelf: 'center' }}>Shopping list</Text>}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => 
          <View style={{ alignSelf: 'center', margin: 5, flexDirection: 'row' }}>
            <Text style={{ fontSize: 18 }}>{item.product}, {item.amount}</Text>
            <Text style={{ fontSize: 18, color: 'blue'}} onPress={() => deleteItem(item.id)}> Bought</Text>
          </View>}
        data={groceries}
        ItemSeparatorComponent={listSeparator}
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
