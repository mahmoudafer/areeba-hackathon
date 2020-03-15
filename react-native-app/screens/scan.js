'use strict'
import React from 'react'
import {
    View,
	StyleSheet,
	Dimensions,
	Modal,
	TouchableOpacity,
	Text
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'

import QRCodeScanner from 'react-native-qrcode-scanner'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addToHistory } from '../redux/actions'
import Header from '../components/header'

const {width, height} = Dimensions.get('screen')

class Scan extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modalVisible: false,
			qrData: {
				amount: 0,
				title: "",
				currency: ""
			}
		}
	}

	closeModal = () => {
		this.setState({modalVisible: false})
		this.scanner.reactivate()
	}

	onSuccess = async (e) => {
		fetch(`http:${this.props.url}/pay`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: this.props.profile.authToken
			},
			body: e.data
		}).then(response => response.json())
		.then((responseJson) => {
			this.setState({status: responseJson.status})
			if (responseJson.status == 201) {
				this.setState({qrData: JSON.parse(e.data)})
				this.props.addToHistory({...JSON.parse(e.data), time: new Date().getTime()})
			}
			this.setState({modalVisible: true})
		})
		.catch((error) => {
            alert("Invalid QR Code!")
			console.error(error)
			this.scanner.reactivate()
		})
	}

	render () {
		return (
            <View style={styles.container}>
				<Header title="Scan"/>
                <QRCodeScanner
                    ref={ref => this.scanner = ref}
                    onRead={this.onSuccess}
					showMarker
					customMarker={<Ionicons name="ios-qr-scanner" color="#FB4239" size={350}/>}
					cameraStyle={styles.scanner}
					containerStyle={styles.cameraContainer}
                />

				{/* Payment added to history Modal */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.modalVisible}
					onRequestClose={() => this.setState({paymentModalVisible: false})}
					hardwareAccelerated
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={{borderRadius: 3, backgroundColor: 'white', elevation: 10, width: width * 0.85, height: width * 0.6, alignItems: "center", justifyContent: "flex-end", marginBottom: height * 0.05}}>
							<View style={{borderRadius:	width, backgroundColor: 'white', elevation: 5, alignSelf: 'center', position: 'absolute', bottom: '80%'}}>
								<AntDesign name={this.state.status == "201" ? "checkcircle" : "exclamationcircle"} color={this.state.status == 201 ? "#82CE34" : "red"} size={100}/>
							</View>
							{
								this.state.status == 201 ?
									<>
										<Text style={{fontSize: 25, marginBottom: 10, fontWeight: "bold", textAlign: 'center'}}>{this.state.qrData.title}</Text>
										<Text style={{fontSize: 20, marginTop: 10, textAlign: 'center'}}>Amount: {this.state.qrData.amount} {this.state.qrData.currency}</Text>
									</>
								:
									<Text style={{fontSize: 20, marginTop: 10, paddingHorizontal: width * 0.1, textAlign: 'center'}}>Hmm payment failed, make sure your card details are correct and try again</Text>
							}
							<TouchableOpacity onPress={this.closeModal}>
								<Text style={{fontSize: 15, textAlign: 'center', color: "white", paddingVertical: 10, paddingHorizontal: '20%', borderRadius: 5, marginTop: 20, marginBottom: width * 0.1, backgroundColor: "#FB4239"}}>Done</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
            </View>
		)
	}
}

const styles = StyleSheet.create({
    container: {
        flex: 1
	},
	
	scanner: {
		height: height * 0.9,
		width: width
	},

	cameraContainer: {
		position: 'absolute',
		top: height * 0.05,
		width: width
	}
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({
		addToHistory
    }, dispatch)
)

const mapStateToProps = (state) => {
    const { scans, url, profile } = state
    return { scans, url, profile }
}

export default connect(mapStateToProps, mapDispatchToProps)(Scan)