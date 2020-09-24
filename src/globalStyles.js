import { createGlobalStyle } from 'styled-components'
export const GlobalStyles = createGlobalStyle`
	body {
		margin: 0px;
		font-family: Verdana, sans-serif;
		font-size: 12px;
		background: ${({ theme }) => theme.body};
		color: ${({ theme }) => theme.text};
	}
	div.Pane {
		overflow: auto;
		padding: 0px
	}
	a {
		color: ${({ theme }) => theme.link}
	}
	button {
		border: 1px solid grey;
		border-radius: 4px;
		background-color: ${(props) => props.theme.buttonbg};
		color: ${(props) => props.theme.buttonfg};
		&: hover {
			color: ${(props) => props.theme.buttonbg};
			background-color: ${(props) => props.theme.buttonfg};
		}
	}
	select {
		background: ${(props) => props.theme.dropdownbg};
		color: ${(props) => props.theme.dropdownfg};
	}
	#itemcontent >* img {
		max-width: 100%;
	}
	.cnh_holding button {
		background: -webkit-linear-gradient(
			${(props) => props.theme.buttonbg},
			${(props) => props.theme.buttonbg})
			${(props) => props.theme.buttonfg} no-repeat 0 0;
		background: linear-gradient(
			${(props) => props.theme.buttonfg},
			${(props) => props.theme.buttonfg})
			${(props) => props.theme.buttonbg} no-repeat 0 0;
		mix-blend-mode: multiply;
		background-size: 100% 100%;
		-webkit-animation: fill 2s forwards infinite;
		animation: fill 2s forwards infinite;
		color: ${(props) => props.theme.buttonbg};
	}
	@-webkit-keyframes fill {
		to { background-size: 100% 0}
	}
	@keyframes fill {
		to { background-size: 100% 0}
	}
	.cnh_holding div {
		background: -webkit-linear-gradient(to left, darkred, darkred) darkred no-repeat 0 0;
		background: linear-gradient(to left, darkred, darkred) darkred no-repeat 0 0;
		mix-blend-mode: normal;
		background-size: 220% 100%;
		-webkit-animation: bar 2s forwards infinite;
		animation: bar 2s forwards infinite;
	}
	@-webkit-keyframes bar {
		from { background-position: -120% 0}
		to { background-position: 0 0}
	}
	@keyframes bar {
		from { background-position: -120% 0}
		to { background-position: 0 0}
	}
	`
