import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
    jwksUri: process.env.JWKS_URI,
});

function getKey(header, cb){
    client.getSigningKey(header.kid, function(err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        cb(null, signingKey);
    });
}

const options = {
    // audience is found on the dashboard api page.
    audience: process.env.AUDIENCE,
    issuer: process.env.ISSUER,
    algorithms: ['RS256'],
};

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId, methodArn) => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

export async function handler(event, context) {
    if (!event.authorizationToken) {
        throw 'Unauthorized';
    }
    
    try {
        const token = event.authorizationToken.replace('Bearer ', '');
        const policy = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, options, (err, decoded) => {
                if (err) reject(err);
                if (decoded) {
                    const claimsPolicy = generatePolicy(decoded.sub, event.methodArn);
                    resolve({ ...claimsPolicy, context: {
                        id: decoded.sub,
                        email: decoded[`${process.env.CUSTOM_POLICY_PREFIX}/email`],
                        avatar: decoded[`${process.env.CUSTOM_POLICY_PREFIX}/picture`],
                        nickname: decoded[`${process.env.CUSTOM_POLICY_PREFIX}/nickname`],
                    } });
                }
            });
        });
        return policy;
    } catch (error) {
        console.log('error', error);
        throw new Error('Unauthorized');
    }
};
