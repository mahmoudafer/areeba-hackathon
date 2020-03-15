import { combineReducers } from 'redux'

const INITIAL_STATE = {
	payments: [],
	profile: {
		history: []
	},
	url: "192.168.31.149:3000"
}

const paymentsReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'ADD_PAYMENT':
			state.push(action.payload)
			return [...state]
		case 'REMOVE_PAYMENT':
			state.splice(action.payload, 1)
			return [...state]
		default:
			return state
	}
}

const profileReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'SET_PROFILE':
			console.log(action.payload)
			return {...action.payload.profile, authToken: action.payload.authToken, history: action.payload.profile.payments || []}
		case 'SET_CARD':
			state.card = action.payload
			return {...state}
		case 'ADD_HISTORY':
			state.history.push(action.payload)
			state.history = [...state.history]
			return {...state}
		default:
			return state
	}
}

const urlReducer = (state = INITIAL_STATE, action) => {
	return state
}

const appReducer = combineReducers({
	payments: paymentsReducer,
	profile: profileReducer,
	url: urlReducer
})

const rootReducer = (state = INITIAL_STATE, action) => {
	if (action.type === 'LOGOUT') {
		state = {...INITIAL_STATE}
	}
  
	return appReducer(state, action)
}

export default rootReducer