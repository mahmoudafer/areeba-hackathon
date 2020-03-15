'use strict'
import React from 'react'
import {
	View,
	StyleSheet,
	FlatList,
	Text,
	Modal,
	Dimensions,
	TouchableOpacity,
	ScrollView,
	Keyboard,
	TextInput
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Header from '../components/header'
import QRCode from 'react-native-qrcode-svg'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setProfile, logout, addPayment, removePayment, setCard } from '../redux/actions'

const {width, height} = Dimensions.get('screen')

function epochToReadableTime (millis) {
	if (!millis)
		return ""
	const date = new Date(millis)
	return date.getDate()
		+ ' ' + ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]
		+ ' ' + date.getFullYear()
		+ ' at ' + date.getHours() + ':' + (Math.floor(date.getMinutes() / 10) ? date.getMinutes() : '0' + date.getMinutes())
}
function HistoryListItem (props) {
	return (
		<TouchableOpacity style={styles.historyListItem} onPress={props.onPress} disabled={props.disabled}>
			<View>
				<View style={{justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: width * 0.9}}>
					<Text style={styles.historyItemName}>{props.item.title}</Text>
					<Text style={{color: "#aaa", fontSize: 15}}>{epochToReadableTime(props.item.time)}</Text>
				</View>
				<Text style={styles.historyItemCompany}>{props.item.amount} {props.item.currency}</Text>
			</View>
			{
				!props.item.time &&
				<TouchableOpacity onPress={props.remove} style={{position: 'absolute', bottom: width * 0.02, right: width * 0.03}}>
					<Ionicons name="md-trash" size={26}/>
				</TouchableOpacity>
			}
		</TouchableOpacity>
	)
}

class Profile extends React.Component {
	constructor(props) {
		super(props)
		const {cardCVV, cardName, cardNumber, expiryMM, expiryYY} = props.profile.card
		this.state={
			activeList: 'Payments',
			cardCVV,
			cardName,
			cardNumber,
			expiryMM,
			expiryYY,
			insertPaymentModalVisible: false,
			paymentModalVisible: false,
			qrData: {}
		}
		console.log(props.payments)
	}

	activateList = name => {
		this.setState({activeList: name})
	}

	logout = () => {
		this.props.logout()
		setTimeout(() => {
			this.props.navigation.navigate("Login")
		}, 0)
	}

	updateCard = () => {
		const {cardCVV, cardName, cardNumber, expiryMM, expiryYY} = this.state
		const details = {
			cardCVV,
			cardName,
			cardNumber,
			expiryMM,
			expiryYY
		}
		fetch(`http://${this.props.url}/card`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: this.props.profile.authToken
			},
			body: JSON.stringify({
				...details
			})
		}).then(res => res.json()).then(res => {
			if (res.status == 200) {
				this.props.setCard(details)
				alert("card updated")
			}
			else this.setState({error: res.message})
		}).catch(console.error)
	}

	insertPayment = () => {
		const {amount, currency, title} = this.state
		this.props.addPayment({amount, currency, title})
		this.setState({insertPaymentModalVisible: false})
	}

	showPaymentModal = (qrData) => {
		this.setState({qrData, paymentModalVisible: true})
	}

	render () {
		return (
			<View style={styles.container}>
				{/* insert Payment Modal */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.insertPaymentModalVisible}
					onRequestClose={() => this.setState({insertPaymentModalVisible: false})}
					hardwareAccelerated
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={{borderRadius: 3, backgroundColor: 'whitesmoke', elevation: 10, width: width * 0.85, height: height * 0.5, alignItems: "center", justifyContent: "center", overflow: 'hidden', marginBottom: height * 0.05}}>
							<TouchableOpacity style={{position: 'absolute', top: 10, right: 10}} onPress={() => this.setState({insertPaymentModalVisible: false})}>
								<AntDesign name="closesquare" size={25}/>
							</TouchableOpacity>
							<Text style={styles.modalText}>Payment Title / Label</Text>
							<TextInput style={{...styles.input, width: '80%'}}
								onChangeText={(val) => this.setState({title: val})}
								onSubmitEditing={Keyboard.dismiss}
								placeholder={"Title"} 
								placeholderTextColor='rgba(0,0,0,0.3)' 
								selectionColor="#FB4239"
							/>
							<Text style={styles.modalText}>Payment Amount</Text>
							<TextInput style={{...styles.input, width: '80%'}}
								onChangeText={(val) => this.setState({amount: val})}
								onSubmitEditing={Keyboard.dismiss}
								placeholder={"Payment Amount"} 
								placeholderTextColor='rgba(0,0,0,0.3)' 
								selectionColor="#FB4239"
							/>
							<Text style={styles.modalText}>Payment Currency</Text>
							<TextInput style={{...styles.input, width: '80%'}}
								onChangeText={(val) => this.setState({currency: val})}
								onSubmitEditing={Keyboard.dismiss}
								placeholder={"Currency"} 
								placeholderTextColor='rgba(0,0,0,0.3)' 
								selectionColor="#FB4239"
							/>
							<TouchableOpacity onPress={this.insertPayment} disabled={!this.state.amount || !this.state.currency || !this.state.title}>
								<Text style={{fontSize: 15, textAlign: 'center', color: "white", paddingVertical: 10, paddingHorizontal: '20%', borderRadius: 5, marginTop: 20, backgroundColor: "#FB4239"}}>ADD</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>

				{/* Payment QRCode Modal */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.paymentModalVisible}
					onRequestClose={() => this.setState({paymentModalVisible: false})}
					hardwareAccelerated
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={{borderRadius: 3, backgroundColor: 'white', elevation: 10, width: width * 0.85, height: width * 0.9, alignItems: "center", justifyContent: "center", overflow: 'hidden', marginBottom: height * 0.05}}>
							<TouchableOpacity style={{position: 'absolute', top: 10, right: 10}} onPress={() => this.setState({paymentModalVisible: false})}>
								<AntDesign name="closesquare" size={25}/>
							</TouchableOpacity>
							<Text style={{fontSize: 25, marginBottom: 10, fontWeight: "bold"}}>{this.state.qrData.title}</Text>
							<QRCode
								value={JSON.stringify({amount: this.state.qrData.amount, currency: this.state.qrData.currency, title: this.state.qrData.title})}
								size={width * 0.5}
								color="rgba(150, 55, 153, 1)"
							/>
							<Text style={{fontSize: 20, marginTop: 10}}>Amount: {this.state.qrData.amount} {this.state.qrData.currency}</Text>
						</View>
					</View>
				</Modal>

				{/* header */}
				<Header title="Profile">
					<TouchableOpacity onPress={() => this.logout()}>
						<AntDesign name="logout" size={27} color="#FB4239"/>
					</TouchableOpacity>
				</Header>
				<ScrollView showsVerticalScrollIndicator={false}>
					<Text style={{fontSize: 23, textAlign: "center", marginTop: height * 0.01, backgroundColor: '#FB4239', color: 'white', width: width * 0.6, alignSelf: "center", padding: width * 0.01, borderRadius: 100}}>Card Details</Text>
					<View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center',}}>
						{[{field: "cardNumber", label: "Card Number", style: {width: "85%"}},
						{field: "cardName", label: "Card Name", style: {width: "53%"}},
						{field: "cardCVV", label: "Card CVV", style: {width: "30%"}},
						{field: "expiryMM",label: "Expiry MM" },
						{field: "expiryYY", label: "Expiry YY"}].map(({field, label, style}) => {
							return (
								<View style={{width: "40%", alignItems: "center", ...style}}>
									<Text style={{fontSize: 18, textAlign: 'center', paddingVertical: 5}}>{label}</Text>
									<TextInput style = {styles.input}
										onChangeText={(val) => this.setState({[field]: val})}
										onSubmitEditing={Keyboard.dismiss}
										ref={(input)=> this.passwordInput = input} 
										placeholder={label} 
										placeholderTextColor='rgba(0,0,0,0.3)' 
										selectionColor="#FB4239"
										value={this.state[field]}
									/>
								</View>
							)
						})}
					</View>
					<TouchableOpacity onPress={() => this.updateCard()} style={{backgroundColor: "rgba(150, 55, 153, 1)", borderRadius: 10, padding: 10, width: width * 0.3, alignSelf: "center",  marginTop: height * 0.02}}>
						<Text style={{fontSize: 15, textAlign: 'center', color: "white"}}>Update Card</Text>
					</TouchableOpacity>
					<View style={styles.activeSelector}>
						<TouchableOpacity
							onPress={() => this.activateList("Payments")}
						>
							<Text
								style={{
									...styles.activeSelectorText,
									color: this.state.activeList === "Payments" ? "white" : "#FB4239",
									backgroundColor: this.state.activeList === "Payments" ? "#FB4239" : "white",
									paddingRight: width * 0.07
								}}
							>
								Payments
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => this.activateList("History")}
						>
							<Text
								style={{
									...styles.activeSelectorText,
									color: this.state.activeList === "History" ? "white" : "#FB4239",
									backgroundColor: this.state.activeList === "History" ? "#FB4239" : "white",
									paddingLeft: width * 0.07
								}}
							>
								History
							</Text>
						</TouchableOpacity>
					</View>
					<View>
						<FlatList
							showsVerticalScrollIndicator={false}
							data={this.state.activeList === "Payments" ? this.props.payments : this.props.profile.history}
							renderItem={({item, index}) => (
								<HistoryListItem
									item={item}
									remove={() => this.props.removePayment(index)}
									onPress={() => this.showPaymentModal(item)}
									disabled={this.state.activeList !== "Payments"}
								/>
							)}
							style={styles.historyList}
							keyExtractor={(item, key) => item.id}
							contentContainerStyle={{paddingBottom: width * 0.015}}
						/>
						{
							this.state.activeList === "Payments" &&
							<TouchableOpacity style={styles.addButton} onPress={() => this.setState({insertPaymentModalVisible: true})}>
								<AntDesign name="pluscircle" size={35} color="#FB4239"/>
							</TouchableOpacity>
						}
					</View>
				</ScrollView>
			</View>
		)
	}
}

const mapDispatchToProps = dispatch => (
	bindActionCreators({
		setProfile,
		logout,
		setCard,
		addPayment,
		removePayment
	}, dispatch)
)

const mapStateToProps = (state) => {
	const { payments, profile, url } = state
	return { payments, profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:'whitesmoke'
	},

	modalText: {
		fontSize: 18,
		paddingVertical: 10
	},
	
	input: {
		backgroundColor: 'white',
		borderRadius: 10,
		width: "90%"
	},

	historyListItem: {
		backgroundColor: 'white',
		height: height * 0.12,
		borderRadius: 10,
		padding: width * 0.01,
		marginTop: width * 0.015,
		flexDirection: 'row'
	},

	historyList: {
		width: width * 0.97,
		alignSelf: 'center'
	},

	activeSelector: {
		borderWidth: 2,
		borderColor: "#FB4239",
		borderRadius: 30,
		flexDirection: "row",
		alignItems: 'center',
		justifyContent: "center",
		marginTop: height * 0.015,
		marginBottom: height * 0.01,
		width: width * 0.67,
		alignSelf:'center',
		backgroundColor: 'white',
		overflow:'hidden',
	},

	activeSelectorText: {
		fontSize: 18,
		paddingTop: width * 0.01,
		paddingBottom: width * 0.015,
		paddingHorizontal: width * 0.093,
		alignSelf: "center",
		textAlign: 'center',
		fontFamily: 'Roboto'
	},
	
	historyItemName: {
		fontFamily: 'sans-serif-light',
		fontSize: 25,
		fontWeight: 'bold',
		marginLeft: width * 0.02
	},

	historyItemCompany: {
		fontSize: 17,
		marginLeft: width * 0.02
	},

	addButton: {
		alignItems: "center",
		marginTop: 5,
		marginBottom: 10
	}
})
