import { View, StyleSheet } from 'react-native';

const Line = () => {
    return (
        <View style={styles.line}/>
    )
}

export default Line;

styles = StyleSheet.create({
    line: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
})