import { ApolloLink, execute } from 'apollo-link';
import { SchemaLink } from 'apollo-link-schema';
import * as classNames from 'classnames';
import * as indexedDBAdapter from 'fortune-indexeddb';
import * as GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import { parse } from 'graphql';
import { FortuneOptions, GraphQLGenie } from 'graphql-genie';
import { addMockFunctionsToSchema } from 'graphql-tools';
import * as defaultIDL from 'raw-loader!./default-schema.graphql';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AboutComponent } from './about';
import './css/app.css';
import './css/codemirror.css';
import './css/form.css';
import { SettingsComponent } from './settings';

type GenieEditorState = {
	value: string | null;
	copyValue: string | null;
	cachedValue: string | null;
	activeTab: number;
	dirty: boolean;
	error: string | null;
	status: string | null;
	genie: GraphQLGenie | null;
	dirtyGenie: GraphQLGenie | null;
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
		const data = localStorage.getItem('settings.data') || 'memory';
		localStorage.setItem('settings.data', data);
		this.state = {
			value: null,
			copyValue: null,
			cachedValue: null,
			activeTab: 0,
			dirty: false,
			dirtyGenie: null,
			error: null,
			status: null,
			genie: null,
			link: null,
			data: data
		};
	}

	componentDidMount() {
		const currIDL = localStorage.getItem('currIDL') || defaultIDL;
		localStorage.setItem('currIDL', currIDL);
		this.updateIdl(currIDL);
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

	buildSchema(value): Promise<GraphQLGenie> {
		if (!value) return Promise.reject(null);

		const fortuneOptions: FortuneOptions = {
			settings: { enforceLinks: true }
		};
		if (this.state.data === 'db') {
			fortuneOptions.adapter = [ indexedDBAdapter, {
				// Name of the IndexedDB database to use. Defaults to `fortune`.
				name: 'fortune'
			} ];
		}
		const genie = new GraphQLGenie({ typeDefs: value, fortuneOptions});
		const schemaPromise: Promise<GraphQLGenie> = new Promise((resolve, reject) => {
			genie.init().then(() => {
				const schema = genie.getSchema();
				if (this.state.data === 'mock') {
					addMockFunctionsToSchema({
						schema,
						preserveResolvers: false
					});
				}
				resolve(genie);
			}).catch((e) => {
				this.setState(prevState => ({ ...prevState, error: e.message }));
				console.error(e);
				reject(e);
			});
		});
		return schemaPromise;
	}

	getLink(schema): ApolloLink | null {
		let link: ApolloLink | null = null;
		if (schema !== null) {
			link = new SchemaLink({ schema });
		}

		return link;
	}

	updateIdl(value, noError = false): Promise<boolean> {
		try {
			const schemaPromise = this.buildSchema(value);
			return new Promise(resolve => {
				schemaPromise.then(genie => {
					const link = this.getLink(genie.getSchema());
					this.setState(prevState => ({
						...prevState,
						value,
						copyValue: genie.printSchema(),
						genie,
						link,
						error: null,
					}));
				});
				resolve(true);
			});
		} catch (e) {
			if (noError) return Promise.resolve(false);
			this.setState(prevState => ({ ...prevState, error: e.message }));
			console.error(e);
			return Promise.resolve(false);
		}
	}

	setStatus(status, delay) {
		this.setState(prevState => ({ ...prevState, status: status }));
		if (!delay) return;
		setTimeout(() => {
			this.setState(prevState => ({ ...prevState, status: null }));
		}, delay);
	}

	saveUserIDL = (): void => {
		const { value, dirty } = this.state;
		if (!dirty) return;
		this.updateIdl(value).then(success => {
			if (!success) return;
			localStorage.setItem('currIDL', value || '');
			this.setState(prevState => ({
				...prevState,
				cachedValue: value,
				dirty: false,
				dirtySchema: null,
				error: null,
			}));
		});
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
		let promise: Promise<boolean>;
		// tslint:disable-next-line:prefer-conditional-expression
		if (this.state.error) {
			promise = this.updateIdl(val);
		} else {
			promise = Promise.resolve(true);
		}
		promise.then(() => {
			this.buildSchema(val).then(dirtyGenie => {
				this.setState(prevState => ({
					...prevState,
					value: val,
					dirty: val !== this.state.cachedValue,
					dirtyGenie,
				}));
			});

		});
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
		localStorage.setItem(`settings.${name}`, value);
		this.setState(prevState => ({
			...prevState,
			[name]: value
		}), () => {
			this.updateIdl(this.state.value);
		});
	}
	render() {
		const {data, copyValue, value, activeTab, genie, dirty, dirtyGenie} = this.state;
		const dirtySchema = dirtyGenie ? dirtyGenie.getSchema() : null;
		const schema = genie ? genie.getSchema() : null;
		return (
			<div className="genie-editor-container">
				{(activeTab === 0 || activeTab === 2) &&
					<style dangerouslySetInnerHTML={{
						__html: `
								.CodeMirror-lint-tooltip { display: none!important; }
								.CodeMirror-hints { display: none!important; }
							`}} />
				}
				<nav>
					<div className="logo">
						<a href="https://github.com/genie-team/graphql-genie" target="_blank">
							{' '}
							<img src="/resources/logo.svg" />{' '}
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
							onClick={() => this.state.genie && this.switchTab(1)}
							className={classNames({
								'-disabled': !this.state.genie,
								'-active': activeTab === 1,
							})}
						>
							{' '}
							<ion-icon name="search" ></ion-icon>{' '}
						</li>
						<li
							onClick={() => this.state.genie && this.switchTab(2)}
							className={classNames({
								'-disabled': !this.state.genie,
								'-active': activeTab === 2,
							})}
						>
							{' '}
							<ion-icon name="copy"></ion-icon>{' '}
						</li>
						<div className="-pulldown">
							<li
								onClick={() => this.state.genie && this.switchTab(3)}
								className={classNames({
									'-active': activeTab === 3,
								})}
							>
								{' '}
								<ion-icon name="settings"></ion-icon>{' '}
							</li>
							<li
								onClick={() => this.state.genie && this.switchTab(4)}
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
						{schema && (
							<GraphiQL fetcher={e => this.graphQLFetcher(e)} schema={schema} />
						)}
					</div>
					<div
						className={classNames('editor-container', 'schema-editor', 'tab-content', {
							'-active': activeTab === 2,
						})}
					>
						{schema && (
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
						<SettingsComponent checked={data} handleSettingsChange={this.handleSettingsChange}></SettingsComponent>
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
