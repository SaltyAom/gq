/**
 * Append HTTP Header that will sent with request
 */
type Header = Omit<RequestInit, 'body'>

export interface GraphQLError {
	message: string
	locations: {
		line: number
		column: number
	}
}

/**
 * GraphQL Client
 *
 * You can config client option here
 *
 * @example
 * import gql, { config } from '@saltyaom/gq'
 *
 * client.config('http://api.opener.studio/graphql')
 **/
export const client: {
	_e: string
	_h: Header
	config: (endpoint: string, header?: Header) => void
} = {
	_e: '',
	_h: {},

	config: function (endpoint: string, header: Header = {}) {
		this._e = endpoint
		this._h = header
	}
}

const getOperationName = (query: string) => {
	let [_, __, operationName] =
		query.match(/(query|mutation|subscription) (.*?) {/) ||
		([false, '', ''] as const)

	return operationName.split('(')[0] || '_'
}

interface Options<V extends Object = Object> {
	/**
	 * GraphQL variables
	 *
	 * @default {}
	 */
	variables?: V
	/**
	 * `fetch` config
	 *
	 * @default {}
	 */
	config?: Header
}

/**
 * SaltyAom's GraphQL
 *
 * Lightweight graphql client, minify query on fly.
 *
 * Supports only query and mutation.
 *
 * @example
 * import gql, { client } from '@saltyaom/gq'
 *
 * client.config('http://api.opener.studio/graphql')
 *
 * gql(`
 *   query GetHentaiById($id: Int!) {
 *     getHentaiById(id: $id) {
 *       success
 *       data {
 *         title {
 *           display
 *         }
 *       }
 *     }
 *   }
 * `,
 * {
 *   variables: {
 *     id: 177013
 *   }
 * }).then((data) => console.log(data))
 **/
const gql = async <T extends Object = Object, V extends Object = Object>(
	query: string,
	{ variables = {} as V, config = {} }: Options<V> = {}
): Promise<T | GraphQLError[] | Error> => {
	let get = (
		typeof fetch == 'undefined' ? await import('isomorphic-unfetch') : fetch
	) as typeof fetch

	let { _e: endpoint, _h: headers } = client

	let { data, errors = null } = await get(endpoint, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			mode: 'cors',
			...headers.headers,
			...config.headers
		},
		...headers,
		...config,
		body: JSON.stringify({
			query,
			variables,
			operationName: getOperationName(query)
		})
	}).then((res) => res.json())

	if (errors) throw errors

	return data
}

export default gql
