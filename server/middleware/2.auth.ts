import { createRemoteJWKSet, jwtVerify } from 'jose-browser-runtime'

export default eventHandler(async (event) => {
  if (event.path.startsWith('/api/') && !event.path.startsWith('/api/_')) {
    const token = getHeader(event, 'cf-access-jwt-assertion')

    if (!token) {
      throw createError({ status: 401, statusText: 'Unauthorized' })
    }

    const { cfAccessTeamDomain, cfAccessPolicyAud } = useRuntimeConfig(event)

    const JWKS_URL = new URL(`/cdn-cgi/access/certs`, cfAccessTeamDomain)
    const JWKS = createRemoteJWKSet(JWKS_URL)

    try {
      await jwtVerify(token, JWKS, {
        issuer: cfAccessTeamDomain,
        audience: cfAccessPolicyAud,
      })
    }
    catch {
      throw createError({ status: 401, statusText: 'Unauthorized' })
    }
  }
})
