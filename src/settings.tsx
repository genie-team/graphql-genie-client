import * as React from 'react';

export class SettingsComponent extends React.Component<any, any> {

	constructor(props) {
		super(props);
	}

	render(): React.ReactNode {
		return (
			<div className="about-markdown">
				<form>
					<input type="radio" name="data" value="mock" onChange={this.props.handleSettingsChange} />Mock
					<input type="radio" name="data" value="memory" onChange={this.props.handleSettingsChange} />Memory
					<input type="radio" name="data" value="db" onChange={this.props.handleSettingsChange} />IndexedDB
				</form>
			</div>
		);
	}
}
