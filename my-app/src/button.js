import { useState, useEffect } from "react";
import {
	PayPalScriptProvider,
	BraintreePayPalButtons,
	// usePayPalScriptReducer
} from "@paypal/react-paypal-js";

// This values are the props in the UI
const style = {"label":"paypal","layout":"vertical"};

export default function BrainTreeButton() {
	const [clientToken, setClientToken] = useState(null);

	const triggerSettingClientToken = async () => {
		await fetch('http://localhost:3005/client_token')
		.then((response) => response.json())
		.then((response) => setClientToken(response?.client_token || response?.clientToken));
	}

	useEffect(() => {
		triggerSettingClientToken();
	}, []);

	return (
		<>
			{clientToken ? (
				<div style={{ maxWidth: "750px", minHeight: "200px" }}>
					<PayPalScriptProvider
						options={{
							"client-id": "test",
							components: "buttons",
							// "data-user-id-token": "your-tokenization-key-here",
							"data-client-token": clientToken,
							intent: "tokenize",
							vault: true,
						}}
						>
						<BraintreePayPalButtons
							style={style}
							disabled={false}
							fundingSource="" // Available values are: ["paypal", "card", "credit", "paylater", "venmo"]
							forceReRender={[style]}
							createBillingAgreement={function (data, actions) {
								return actions.braintree.createPayment({
									// Required
									flow: "vault",
									// The following are optional params
									billingAgreementDescription:
										"Your agreement description",
									enableShippingAddress: true,
									shippingAddressEditable: false,
									shippingAddressOverride: {
										recipientName: "Scruff McGruff",
										line1: "1234 Main St.",
										line2: "Unit 1",
										city: "Chicago",
										countryCode: "US",
										postalCode: "60652",
										state: "IL",
										phone: "123.456.7890",
									},
								});

							}}
							onApprove={function (data, actions) {
								console.log('DATA', data)
								return actions.braintree
									.tokenizePayment(data)
									.then((payload) => {
										// Your code here after capture the order
										console.log('RESULT2', JSON.stringify(payload));
										fetch('http://localhost:3005/create-transaction', {
										method: 'POST',
										headers: {
										mode: 'cors',
									    'Access-Control-Allow-Origin': '*',
										body: JSON.stringify({
											amount: "500.00",
										    paymentMethodNonce: payload.nonce,
											orderId: data.orderID
									})
								},
									})
									});
								}
							}
							onCancel={function (data, actions) {
								console.log('CANCELLED');
								}

							}
						/>
					</PayPalScriptProvider>
				</div>
			) : (
				<h1>Loading token...</h1>
			)}
		</>
	);
};