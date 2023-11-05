import axios from 'axios'

export const createEmail = async (host, username, password) => {
  const client = axios.create({
    withCredentials: true,
  })

  const loginResponse = await client.post(
    `${host}/login?login_only=1`,
    {
      user: username,
      pass: password,
      goto_uri: '/',
    },
    { withCredentials: true },
  )

  await client.get(`${host}${loginResponse.data.redirect}`)
  const securityToken = loginResponse?.data?.security_token

  const tokenResponse = await client.get(
    `${host}/${securityToken}/execute/Tokens/create_full_access?name=brokenc0de666`,
  )

  console.log({ securityToken, tokenResponse: tokenResponse?.data })
}
