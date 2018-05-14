import { ApolloLink, execute } from "apollo-link";
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
import GraphQLEditor from './GraphQLEditor/GraphQLEditor';
import './GraphQLEditor/editor.css';
import './css/app.css';
import './css/codemirror.css';
import { ConsoleIcon, EditIcon, GithubIcon } from './icons';

type GenieEditorState = {
  value: string | null;
  cachedValue: string | null;
  activeTab: number;
  dirty: boolean;
  error: string | null;
  status: string | null;
  schema: GraphQLSchema | null;
  dirtySchema: GraphQLSchema | null;
	link: ApolloLink | null;	
};

class GenieEditor extends React.Component<any, GenieEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      value: null,
      cachedValue: null,
      activeTab: 0,
      dirty: false,
      dirtySchema: null,
      error: null,
      status: null,
      schema: null,
			link: null
    };
  }

  componentDidMount() {
		this.updateIdl(defaultIDL);
    window.onbeforeunload = () => {
      if (this.state.dirty) return 'You have unsaved changes. Exit?';
    };
  }

  graphQLFetcher({query, variables = {}}) {
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
    let { value, dirty } = this.state;
    if (!dirty) return;

		if (!this.updateIdl(value)) return;
		
		return this.setState(prevState => ({
			...prevState,
			cachedValue: value,
			dirty: false,
			dirtySchema: null,
			error: null,
		}));
  };

  switchTab(tab) {
    this.setState(prevState => ({ ...prevState, activeTab: tab }));
  }

  onEdit = (val) => {
    if (this.state.error) this.updateIdl(val);
    let dirtySchema = null as GraphQLSchema | null;
    try {
      dirtySchema = this.buildSchema(val);
    } catch(_) { }

    this.setState(prevState => ({
      ...prevState,
      value: val,
      dirty: val !== this.state.cachedValue,
      dirtySchema,
    }));
  };

  render() {
    let { value, activeTab, schema , dirty, dirtySchema } = this.state;
    return (
      <div className="faker-editor-container">
        <nav>
          <div className="logo">
            <a href="https://github.com/APIs-guru/graphql-faker" target="_blank">
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
              <EditIcon />{' '}
            </li>
            <li
              onClick={() => this.state.schema && this.switchTab(1)}
              className={classNames({
                '-disabled': !this.state.schema,
                '-active': activeTab === 1,
              })}
            >
              {' '}
              <ConsoleIcon />{' '}
            </li>
            <li className="-pulldown -link">
              <a href="https://github.com/APIs-guru/graphql-faker" target="_blank">
                {' '}
                <GithubIcon />{' '}
              </a>
            </li>
          </ul>
        </nav>
        <div className="tabs-container">
          <div
            className={classNames('tab-content', 'editor-container', {
              '-active': activeTab === 0,
            })}
          >
            <GraphQLEditor
              schema={dirtySchema || schema}
              onEdit={this.onEdit}
              onCommand={this.saveUserIDL}
              value={value || ''}
            />
            <div className="action-panel">
              <a
                className={classNames("material-button", {
                  '-disabled': !dirty,
                })}
                onClick={this.saveUserIDL}>
                <span> Save </span>
              </a>
              <div className="status-bar">
                <span className="status"> {this.state.status} </span>
                <span className="error-message">{this.state.error}</span>
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
        </div>
      </div>
    );
  }
}

ReactDOM.render(<GenieEditor />, document.getElementById('container'));
