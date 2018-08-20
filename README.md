<div style="text-align:center"><img width="128px" src="resources/logo.svg" alt="GraphQL Genie Client logo"></div>

# GraphQL Genie Client

- [GraphQL Genie Client](#graphql-genie-client)
	- [Settings](#settings)
			- [Data Mode](#data-mode)
	- [Roadmap](#roadmap)
	- [Contribute or Donate](#contribute-or-donate)
	- [Backers](#backers)
	- [Thanks/Credit](#thankscredit)

[![Dependency Status](https://david-dm.org/genie-team/graphql-genie-client.svg)](https://david-dm.org/genie-team/graphql-genie-client)
[![devDependency Status](https://david-dm.org/genie-team/graphql-genie-client/dev-status.svg)](https://david-dm.org/genie-team/graphql-genie-client/?type=dev)

[![donate](http://img.shields.io/liberapay/receives/aCoreyJ.svg?logo=liberapay)](https://liberapay.com/aCoreyJ/donate) 
[![patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://www.patreon.com/acoreyj/overview) 
[![paypal](https://img.shields.io/badge/paypal-donate-blue.svg)](https://www.paypal.com/pools/c/872dOkFVLP) 	

**View in github pages** [here](https://github.com/genie-team/graphql-genie-client).

A React app providing a demo and example of [GraphQL Genie](https://github.com/genie-team/graphql-genie). __No coding required__.
All you need is to write [GraphQL Type Schema](https://graphql.org/learn/schema/) (or use the example provided). See how [GraphQL Genie](https://github.com/genie-team/graphql-genie) turns graphql type definitions into a fully featured GraphQL API with referential integrity and inverse updates. 

Data can be mocked, stored in memory or stored in your browsers IndexedDB (so refreshing doesn't wipe out your data).

## Settings

#### Data Mode

- Memory

  - Mutations will save to memory and queries will query from memory. Reloading will erase all data

- IndexedDB

  - Mutations will save to browser database and queries will query from the database. Data will be saved on reload of page

- Mock

  - Mutations will do nothing, queries will return mock data

## Roadmap

Ability to export data

## Contribute or Donate
* Code Contributions
	* Fork
	* Make Changes
	* Run the following and make sure no failures or errors
		* npm run build
		* npm run start
	* Open pull request
* Donate 
	* Genie and other genie-team products are outcomes of a hobby and receive no other funding, any and all support would be greatly appreciated if you find Genie products useful. Your support will encourage faster development of bug fixes, new features and new products.
	* [![donate](http://img.shields.io/liberapay/receives/aCoreyJ.svg?logo=liberapay)](https://liberapay.com/aCoreyJ/donate) (preferred)
	* [![patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://www.patreon.com/acoreyj/overview) 
	* [![paypal](https://img.shields.io/badge/paypal-donate-blue.svg)](https://www.paypal.com/pools/c/872dOkFVLP)

## Backers

[Your Name and link Here]

If you contribute and want a thanks callout on genie project READMEs let me know via [twitter message](https://twitter.com/aCoreyJ) (at least .25/week)

## Thanks/Credit

[GraphQL Faker](https://github.com/APIs-guru/graphql-faker) from which I copied the react component

[Prisma GraphQL / Graphcool](https://github.com/prismagraphql/prisma) for inspiration

Logo Icon made by [Freepik](http://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)
