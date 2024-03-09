export const initialState = {
	userInfo: undefined,
	socket: undefined,
	selectedChat: undefined,
	chats: [],
	refreshChat: false,
	notifications: [],
};

const reducer = (state, action) => {
	switch (action.type) {
		case "LOGIN":
			return { ...state, userInfo: action.userInfo };
		case "LOGOUT":
			return { userInfo: undefined, socket: undefined, messages: [] };
		case "SELECT_CHAT":
			return { ...state, selectedChat: action.selectedChat };
		case "SET_SOCKET":
			return { ...state, socket: action.socket };
		case "SET_CHATS":
			return { ...state, chats: action.chats };
		case "REFRESH_CHAT":
			return { ...state, refreshChat: action.refreshChat };
		case "SET_NOTIFICATIONS":
			return { ...state, notifications: action.notifications };
		default:
			return state;
	}
};

export default reducer;
