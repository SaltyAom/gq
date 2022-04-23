import gql, { client } from '@saltyaom/gq'

client.config('https://api.opener.studio/graphql')

gql(
	`query GetHentaiById($id: Int!) {
      getHentaiById(id: $id) {
        success
        data {
          title {
            display
          }
        }
      }
    }
  `,
	{
		variables: {
			id: 177013
		}
	}
).then((data) => console.log(data))
