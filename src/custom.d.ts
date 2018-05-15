declare module 'raw-loader!*' {
  var content: string;
  export = content;
}

declare module '*.css' {
  var content: any;
  export = content;
}

declare namespace JSX {
		interface IntrinsicElements {
				'ion-icon': any;
		}
}
