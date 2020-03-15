import React, { Component } from 'react'
import { View, Text, TextInput, Easing, StyleSheet, TouchableOpacity, BackHandler, Image, KeyboardAvoidingView, Dimensions, StatusBar, Animated, Keyboard } from 'react-native'

const {height, width} = Dimensions.get("screen")

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setProfile } from '../redux/actions'

class Login extends Component {
	constructor (props) {
        super(props)
        console.log(props.profile)
        if (props.profile.authToken)
            props.navigation.replace("Home")
		this.state = {
            name: null,
            phone: null,
			email: null,
			password: null,
			error: null
		},
        this.signupHeightBackFont = new Animated.Value(0)
        this.signupOpacity = new Animated.Value(0)
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    }
    componentWillUnmount() {
        this.backHandler.remove()
    }
    
    // called when the user presses the signup button
	onSignup = () => {
        // if in login, go to signup
		if (JSON.stringify(this.signupHeightBackFont) == 0)
			Animated.sequence([
				Animated.timing(
					this.signupHeightBackFont, {
						toValue: 1,
						duration: 150,
						easing: Easing.ease,
					}
				),
				Animated.timing(
					this.signupOpacity, {
						toValue: 1,
						duration: 100,
						easing: Easing.ease,
					}
                )
            ]).start()
        // if already in signup, make the signup request
		else
            if (this.state.email && this.state.password && this.state.name)
                fetch(`http://${this.props.url}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
						'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.state.email,
						password: this.state.password,
                        name: this.state.name,
                        phone: this.state.phone
                    })
                }).then(res => res.json()).then(res => {
                    console.warn(res)
                    if (res.authToken) {
                        this.props.setProfile({authToken: res.authToken, profile: res.profile})
                        this.props.navigation.replace("Home")
                    }
				}).catch(console.error)
    }
    
    // called when the user presses the login button
	onLogin = () => {
        // if in signup, go to login
        if (JSON.stringify(this.signupHeightBackFont) != 0)
            Animated.sequence([
				Animated.timing(
                    this.signupOpacity, {
                        toValue: 0,
                        duration: 100,
                        easing: Easing.ease,
                    }
                ),
				Animated.timing(
                    this.signupHeightBackFont, {
                        toValue: 0,
                        duration: 150,
                        easing: Easing.ease,
                    }
                )
            ]).start()
        // if already in login, make the login request
        else
            if (this.state.email && this.state.password) {
                fetch(`http://${this.props.url}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: this.state.email,
                        password: this.state.password
                    })
                }).then(res => res.json()).then(res => {
                    if (res.authToken) {
                        console.log(this.props.profile)
                        this.props.setProfile({authToken: res.authToken, profile: res.profile})
                        this.props.navigation.replace("Home")
					}
					else this.setState({error: res.message})
                }).catch(console.error)
            }
	}
	render () {
        // variables for animations
        let Height = this.signupHeightBackFont.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 67]
        }),
        Back = this.signupHeightBackFont.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 0)', 'rgba(245, 84, 76, 1)']
        }),
        Font = this.signupHeightBackFont.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(245, 84, 76, 1)', 'rgb(255, 255, 255)']
        }),
        LoginBack = this.signupHeightBackFont.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(150, 55, 153, 1)', 'rgba(0, 0, 0, 0)']
        }),
        LoginFont = this.signupHeightBackFont.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgb(255, 255, 255)', 'rgba(150, 55, 153, 1)']
        })

		return (
			<KeyboardAvoidingView style={{flex: 1}}>
			<StatusBar barStyle="dark-content"/>
				<View style={styles.container}>
                    <Image source={require('../assets/areeba.jpg')} style={styles.logo}/>
                    {this.state.error && <Text style={{color: "black", textAlign: "center"}}>{this.state.error}</Text>}
                    <Animated.View style={{height: Height, overflow: 'hidden', opacity: this.signupOpacity}}>
                        <TextInput style={{...styles.input, height: "75%"}}
                            onChangeText={val => this.setState({name: val})}
                            returnKeyType="next"
                            onSubmitEditing={() => this.phoneInput.focus()}
                            ref={input => this.name = input} 
                            placeholder='Name' 
                            placeholderTextColor='rgba(0,0,0,0.3)' 
                            selectionColor="#6e2479"
                        />
                    </Animated.View>
                    <Animated.View style={{height: Height, overflow: 'hidden', opacity: this.signupOpacity}}>
                        <TextInput style={{...styles.input, height: "75%"}}
                            onChangeText={val => this.setState({phone: val})}
                            returnKeyType="next"
                            onSubmitEditing={() => this.emailInput.focus()}
                            ref={input => this.phoneInput = input} 
                            placeholder='Phone number' 
                            placeholderTextColor='rgba(0,0,0,0.3)' 
                            selectionColor="#6e2479"
                        />
                    </Animated.View>
                    <TextInput style = {styles.input} 
                        autoCapitalize="none"
                        onChangeText={(val) => this.setState({email: val})}
                        onSubmitEditing={() => this.passwordInput.focus()} 
                        autoCorrect={false} 
                        keyboardType='email-address' 
                        returnKeyType="next" 
                        placeholder='Email' 
                        placeholderTextColor='rgba(0,0,0,0.3)'
                        selectionColor="#6e2479"
                        ref={(input)=> this.emailInput = input} 
                    />
                    <TextInput style = {styles.input}
                        onChangeText={(val) => this.setState({password: val})}
                        returnKeyType="go"
                        onSubmitEditing={Keyboard.dismiss}
                        ref={(input)=> this.passwordInput = input} 
                        placeholder='Password' 
                        placeholderTextColor='rgba(0,0,0,0.3)' 
                        secureTextEntry
                        selectionColor="#6e2479"
                    />
                    <View style={styles.buttons}>
                        <Animated.View style={{...styles.ButtonContainer, backgroundColor: Back, borderWidth: 0}}>
                            <TouchableOpacity onPress={this.onSignup} style={{...styles.ButtonContainer, width: '100%', borderColor: 'rgba(245, 84, 76, 1)'}}>
                                    <Animated.Text style={{...styles.buttonText, color: Font}}>SIGN UP</Animated.Text>
                            </TouchableOpacity>
                        </Animated.View> 
                        <Animated.View style={{...styles.ButtonContainer, backgroundColor: LoginBack, borderWidth: 0}}>
                            <TouchableOpacity  onPress={this.onLogin} style={{...styles.ButtonContainer, width: '100%', borderColor: 'rgba(150, 55, 153, 1)'}}>
                                <Animated.Text style={{...styles.buttonText, color: LoginFont}}>LOGIN</Animated.Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
				</View>
			</KeyboardAvoidingView>
		)
	}
}

// for redux (app state management)
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setProfile,
    }, dispatch)
)

const mapStateToProps = (state) => {
    const { profile, url } = state
    return { profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)

const styles = StyleSheet.create({
	container: {
		flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
	},
	logo: {
        width: width,
        height: width * 0.55,
        resizeMode: "contain",
        marginTop: - height * 0.15
	},
	loginContainer: {
		width: '100%',
		flex: 1
	},
	input: {
        borderColor: 'rgba(0,0,0, 0.2)',
        borderWidth: 2,
		marginVertical: '2%',
        paddingHorizontal: 15,
        paddingVertical: 10,
		color: '#999',
        borderRadius: 15,
        width: width * 0.8,
        fontSize: 18
	},
	ButtonContainer: {
		justifyContent:"center",
		borderRadius: 100,
		borderWidth: 1,
		height: height * 0.06,
		width: "48%"
	},
	buttonText: {
		color: '#fff',
		textAlign: 'center',
		fontWeight: '700'
	},
	buttons: {
        marginTop: height * 0.02,
        width: width * 0.6,        
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	}
})