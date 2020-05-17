//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Avatar } from "react-native-elements";

export default function Users() {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState();

  useEffect(() => {
    db.collection("users").onSnapshot((snap) => {
      let users = [];
      snap.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setUsers(users);
    });
  }, []);

  return user ? (
    <View>
      <View>
        <Avatar
          size="xlarge"
          rounded
          source={{
            uri: `${user.photoURL}`,
          }}
          activeOpacity={0.7}
        />
      </View>
      <View>
        <Text>{user.displayName}</Text>
      </View>
      <TouchableOpacity onPress={() => setUser(null)}>
        <Text>Back to Users List</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Users List</Text>
      {users ? (
        <ScrollView>
          {users.map((user) => (
            <TouchableOpacity key={user.id} onPress={() => setUser(user)}>
              <View>
                <Avatar
                  size="medium"
                  rounded
                  source={{
                    uri: `${user.photoURL}`,
                  }}
                  activeOpacity={0.7}
                />
              </View>
              <View>
                <Text>{user.displayName}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
