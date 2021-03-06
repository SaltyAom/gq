import fetch from 'isomorphic-unfetch'

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

const getOperationIndex = (query: string) => {
	let index = query.indexOf('query')
	if (index > -1) return index + 6

	index = query.indexOf('mutation')
	if (index > -1) return index + 9

	index = query.indexOf('subscription')
	if (index > -1) return index + 13

	return -1
}

const getOperationDelimiter = (operationName: string) => {
	const bracketDelimiter = operationName.indexOf('(')
	const spaceDelimiter = operationName.indexOf(' ')

	// Only circumstance index is equal is that both is -1
	if (bracketDelimiter === spaceDelimiter) return -1

	return spaceDelimiter > bracketDelimiter ? bracketDelimiter : spaceDelimiter
}

export const getOperationName = (query: string) => {
	let opIndex = getOperationIndex(query)
	if (opIndex === -1) return '_'

	let operationName = query.substring(opIndex)

	let delimiterIndex = getOperationDelimiter(operationName)
	if (delimiterIndex === -1) return '_'

	return operationName.substring(0, delimiterIndex) || '_'
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
	/**
	 * Custom Endpoint
	 */
	endpoint?: string
	/**
	 * Custom Method
	 */
	method?: string
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
	{
		variables = {} as V,
		config = {},
		endpoint: overrideEndpoint,
		method = 'POST'
	}: Options<V> = {}
): Promise<T | GraphQLError[] | Error> => {
	let { _e: endpoint, _h: headers } = client

	let { data, errors = null } = await fetch(overrideEndpoint || endpoint, {
		method,
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
