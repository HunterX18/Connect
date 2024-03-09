import { createContext, useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const StateContext = createContext();

export const StateProvider = ({ initialState, reducer, children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const navigate = useNavigate();
	useEffect(() => {
		const userInfo = JSON.parse(localStorage.getItem("userInfo"));
		if (!userInfo) {
			navigate("/");
		}
		dispatch({
			type: "LOGIN",
			userInfo,
		});
	}, [navigate]);

	return (
		<StateContext.Provider value={{ state, dispatch }}>
			{children}
		</StateContext.Provider>
	);
};

export const useStateProvider = () => useContext(StateContext);
