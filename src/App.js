import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { NotificationContainer } from "react-notifications";
import 'react-notifications/lib/notifications.css';
import { UseWalletProvider } from "use-wallet";
import BlockchainProvider from "./context";
import Home from './pages/Home';

function App() {
	return (
		<UseWalletProvider
			chainId={4}
			connectors={{
				portis: { dAppId: "nft-minting" },
			}}>
			<BlockchainProvider>	
				<BrowserRouter>
					<Switch>
						<Route exact path="/" component={Home}></Route>
						<Route exact path="/home" component={Home}></Route>
						<Route path="*" component={Home}></Route>
					</Switch>
					<NotificationContainer />
				</BrowserRouter>
			</BlockchainProvider>
		</UseWalletProvider>
	)
}

export default App;
