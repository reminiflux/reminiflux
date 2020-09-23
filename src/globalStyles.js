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
	`
