import * as MD from 'markdown-it';
import * as readme from 'raw-loader!../README.md';
import * as React from 'react';

type AboutState = {
	markdown: string
};

export class AboutComponent extends React.Component<any, AboutState> {

	constructor(props) {
		super(props);
	}

	componentWillMount() {
		const md = new MD({html: true});
		this.setState({
			markdown: md.render(readme)
		});
	}
	render(): React.ReactNode {
		const { markdown } = this.state;
		return (
			<div className="about">
				<div
					className="about-markdown"
					dangerouslySetInnerHTML={{__html: markdown}}></div>
			</div>
		);
	}
}
