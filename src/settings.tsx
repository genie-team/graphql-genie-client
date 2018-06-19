import * as React from 'react';

export class SettingsComponent extends React.Component<any, any> {

	constructor(props) {
		super(props);
	}

	render(): React.ReactNode {
		return (
			<div className="container">
				<form>
					<div className="control-group">
						<h1> Data Mode </h1>
						<label className="control control--radio" htmlFor="data-memory">
							Memory
							<input id="data-memory" type="radio" name="data" value="memory" checked={this.props.checked === 'memory'} onChange={this.props.handleSettingsChange} />

							<div className="control__indicator"></div>
						</label>
						<label className="control control--radio" htmlFor="data-db">
							IndexedDB
							<input id="data-db" type="radio" name="data" value="db" checked={this.props.checked === 'db'} onChange={this.props.handleSettingsChange} />

							<div className="control__indicator"></div>
						</label>
						<label className="control control--radio" htmlFor="data-mock">
							Mock
							<input id="data-mock" type="radio" name="data" value="mock" checked={this.props.checked === 'mock'} onChange={this.props.handleSettingsChange} />

							<div className="control__indicator"></div>
						</label>
						<span className="description">See about page for details on modes </span>
					</div>
				</form>
			</div>
		);
	}
}
