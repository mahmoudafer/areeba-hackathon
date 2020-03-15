import React from 'react'
import { View, Dimensions, StyleSheet, Text } from 'react-native'
const { height, width } = Dimensions.get('screen')

export default function Header(props) {
	return (
		<View style={{...styles.container, justifyContent: props.children ? 'space-between' : "center", ...props.style}}>
            <Text style={styles.title}>{props.title}</Text>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		height: height * 0.07,
		width: width,
		alignItems: 'center',
		flexDirection: 'row',
        elevation: 8,
		paddingBottom: height * 0.015,
		paddingHorizontal: width * 0.1
    },
    
    title: {
        fontSize: 25,
        fontWeight: "bold",
		color: "#FB4239",
		fontFamily: 'notoserif',
    }
})