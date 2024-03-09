import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { StateProvider } from "./context/StateContext";
import reducer, { initialState } from "./context/StateReducer";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<BrowserRouter>
		<StateProvider initialState={initialState} reducer={reducer}>
			<ChakraProvider>
				<App />
			</ChakraProvider>
		</StateProvider>
	</BrowserRouter>
);
