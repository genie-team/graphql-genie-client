import { ApolloLink, execute } from 'apollo-link';
import { SchemaLink } from 'apollo-link-schema';
import * as classNames from 'classnames';
import * as GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import { GraphQLSchema, parse } from 'graphql';
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools';
import * as defaultIDL from 'raw-loader!./default-schema.graphql';
import * as fakeIDL from 'raw-loader!./fake_definition.graphql';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AboutComponent } from './about';
import './css/app.css';
import './css/codemirror.css';
import { SettingsComponent } from './settings';

type GenieEditorState = {
	value: string | null;
	copyValue: string | null;
	cachedValue: string | null;
	activeTab: number;
	dirty: boolean;
	error: string | null;
	status: string | null;
	schema: GraphQLSchema | null;
	dirtySchema: GraphQLSchema | null;
	link: ApolloLink | null;
	data: string | null;
};

class GenieEditor extends React.Component<any, GenieEditorState> {

	private queryEditorComponent: GraphiQL.QueryEditor;
	private queryCopierComponent: GraphiQL.QueryEditor;
	constructor(props) {
		super(props);
		this.queryEditorComponent = React.createRef();
		this.queryCopierComponent = React.createRef();

		this.state = {
			value: null,
			copyValue: null,
			cachedValue: null,
			activeTab: 0,
			dirty: false,
			dirtySchema: null,
			error: null,
			status: null,
			schema: null,
			link: null,
			data: null
		};
	}

	componentDidMount() {
		this.updateIdl(defaultIDL);
		window.onbeforeunload = () => {
			if (this.state.dirty) return 'You have unsaved changes. Exit?';
		};
	}

	graphQLFetcher({ query, variables = {} }) {
		if (this.state.link !== null) {
			return execute(this.state.link, {
				query: parse(query),
				variables: variables
			});
		}
	}

	buildSchema(value): GraphQLSchema {
		const schema = makeExecutableSchema({ typeDefs: value + '\n' + fakeIDL });
		addMockFunctionsToSchema({
			schema
		});
		return schema;
	}

	getLink(schema = this.state.schema): ApolloLink | null {
		let link: ApolloLink | null = null;
		if (schema !== null) {
			link = new SchemaLink({ schema });
		}

		return link;
	}

	updateIdl(value, noError = false) {
		try {
			const schema = this.buildSchema(value);
			const link = this.getLink(schema);
			this.setState(prevState => ({
				...prevState,
				value,
				copyValue: value + '\n' + fakeIDL,
				schema,
				link,
				error: null,
			}));
			return true;
		} catch (e) {
			if (noError) return;
			this.setState(prevState => ({ ...prevState, error: e.message }));
			return false;
		}
	}

	setStatus(status, delay) {
		this.setState(prevState => ({ ...prevState, status: status }));
		if (!delay) return;
		setTimeout(() => {
			this.setState(prevState => ({ ...prevState, status: null }));
		}, delay);
	}

	saveUserIDL = () => {
		const { value, dirty } = this.state;
		if (!dirty) return;

		if (!this.updateIdl(value)) return;

		return this.setState(prevState => ({
			...prevState,
			cachedValue: value,
			copyValue: value + '\n' + fakeIDL,
			dirty: false,
			dirtySchema: null,
			error: null,
		}));
	}

	switchTab(tab) {

		this.setState(prevState => ({ ...prevState, activeTab: tab }));
		const that = this;
		if (tab === 0 && this.queryEditorComponent) {
			setTimeout(function () {
				that.queryEditorComponent.getCodeMirror().refresh();
			}, 1);
		} else if (tab === 2 && this.queryCopierComponent) {
			setTimeout(function () {
				that.queryCopierComponent.getCodeMirror().refresh();
			}, 1);
		}
	}

	onEdit = (val) => {
		if (this.state.error) this.updateIdl(val);
		let dirtySchema = null as GraphQLSchema | null;
		try {
			dirtySchema = this.buildSchema(val);
		} catch (_) {
			// empty by design
		}

		this.setState(prevState => ({
			...prevState,
			value: val,
			dirty: val !== this.state.cachedValue,
			dirtySchema,
		}));
	}

	copyToClipboard = (value) => {
		if (!value) return;
		const el = document.createElement('textarea');
		el.value = value;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}

	handleSettingsChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	}
	render() {
		const {data, copyValue, value, activeTab, schema, dirty, dirtySchema } = this.state;
		return (
			<div className="genie-editor-container">
				{(activeTab === 0 || activeTab === 2) &&
					<style dangerouslySetInnerHTML={{
						__html: `
								.CodeMirror-lint-tooltip { display: none!important; }
							`}} />
				}
				<nav>
					<div className="logo">
						<a href="https://github.com/genie-team" target="_blank">
							{' '}
							<img src="./logo.svg" />{' '}
						</a>
					</div>
					<ul>
						<li
							onClick={() => this.switchTab(0)}
							className={classNames({
								'-active': activeTab === 0,
								'-dirty': dirty,
							})}
						>
							{' '}
							<ion-icon name="create"></ion-icon>{' '}
						</li>
						<li
							onClick={() => this.state.schema && this.switchTab(1)}
							className={classNames({
								'-disabled': !this.state.schema,
								'-active': activeTab === 1,
							})}
						>
							{' '}
							<ion-icon name="search" ></ion-icon>{' '}
						</li>
						<li
							onClick={() => this.state.schema && this.switchTab(2)}
							className={classNames({
								'-disabled': !this.state.schema,
								'-active': activeTab === 2,
							})}
						>
							{' '}
							<ion-icon name="copy"></ion-icon>{' '}
						</li>
						<div className="-pulldown">
							<li
								onClick={() => this.state.schema && this.switchTab(3)}
								className={classNames({
									'-active': activeTab === 3,
								})}
							>
								{' '}
								<ion-icon name="settings"></ion-icon>{' '}
							</li>
							<li
								onClick={() => this.state.schema && this.switchTab(4)}
								className={classNames({
									'-active': activeTab === 4,
								})}
							>
								{' '}
								<ion-icon name="information-circle-outline" ></ion-icon>{' '}
							</li>
							<li className="-link">
								<a className="white-link" href="https://github.com/genie-team" target="_blank">
									{' '}
									<ion-icon name="logo-github" ></ion-icon>{' '}
								</a>
							</li>
						</div>

					</ul>
				</nav>
				<div className="tabs-container">
					<div
						className={classNames('schema-editor', 'tab-content', 'editor-container', {
							'-active': activeTab === 0,
						})}
					>
						<div className="graphiql-container">
							<div className="editorWrap">

								<div className="topBarWrap">
									<div className="topBar">
										<div className="title"><span>Edit Schema Type Definitions</span></div>
										<div className="toolbar">
											<a
												className={classNames('save-button', 'toolbar-button', {
													'-disabled': !dirty,
												})}
												onClick={this.saveUserIDL}>
												<span><ion-icon name="save"></ion-icon> Save </span>
											</a>
											<a className="toolbar-button" title="Copy To Clipboard" onClick={() => this.copyToClipboard(value)}>
												<span><ion-icon name="copy"></ion-icon> Copy To Clipboard</span>
											</a>
											<div className="status-bar">
												<span className="status"> {this.state.status} </span>
												<span className="error-message">{this.state.error}</span>
											</div>
										</div>
									</div>
								</div>
								<GraphiQL.QueryEditor
									ref={n => {
										this.queryEditorComponent = n;
									}}
									schema={dirtySchema || schema}
									onEdit={this.onEdit}
									onRunQuery={this.saveUserIDL}
									value={value || ''}
								/>
							</div>
						</div>
					</div>
					<div
						className={classNames('tab-content', {
							'-active': activeTab === 1,
						})}
					>
						{this.state.schema && (
							<GraphiQL fetcher={e => this.graphQLFetcher(e)} schema={this.state.schema} />
						)}
					</div>
					<div
						className={classNames('editor-container', 'schema-editor', 'tab-content', {
							'-active': activeTab === 2,
						})}
					>
						{this.state.schema && (
							<div className="graphiql-container">
								<div className="editorWrap">

									<div className="topBarWrap">
										<div className="topBar">
											<div className="title"><span>Full Genie Schema</span></div>
											<div className="toolbar">
												<a className="toolbar-button" title="Copy To Clipboard" onClick={() => this.copyToClipboard(copyValue)}>
													<ion-icon name="copy"></ion-icon> Copy To Clipboard
												</a>
											</div>
										</div>
									</div>
									<GraphiQL.QueryEditor
										ref={n => {
											this.queryCopierComponent = n;
										}}
										schema={schema}
										value={copyValue || ''}
										readOnly={true}
									/>
								</div>
							</div>
						)}
					</div>
					<div
						className={classNames('tab-content', {
							'-active': activeTab === 3,
						})}
					>
					{data}
						<SettingsComponent handleSettingsChange={this.handleSettingsChange}></SettingsComponent>
					</div>
					<div
						className={classNames('tab-content', {
							'-active': activeTab === 4,
						})}
					>
						<AboutComponent></AboutComponent>
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<GenieEditor />, document.getElementById('container'));
