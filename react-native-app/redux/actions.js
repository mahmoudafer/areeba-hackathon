export const addPayment = scanObj => (
	{
		type: 'ADD_PAYMENT',
		payload: scanObj,
	}
)

export const removePayment = index => (
	{
		type: 'REMOVE_PAYMENT',
		payload: index,
	}
)

export const toggleFavorite = index => (
	{
		type: 'TOGGLE_FAVORITE_SCAN',
		payload: index
	}
)

export const setProfile = profile => (
	{
		type: 'SET_PROFILE',
		payload: profile
	}
)

export const logout = () => (
	{
		type: 'LOGOUT',
	}
)

export const setCard = details => (
	{
		type: 'SET_CARD',
		payload: details
	}
)

export const addToHistory = payment => (
	{
		type: 'ADD_HISTORY',
		payload: payment
	}
)