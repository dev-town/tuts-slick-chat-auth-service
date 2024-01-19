# Slick Chat - Serverless Auth

Slick Chat Serverless Auth Service - for use as part of the Dev Town "Slick Chat" course.


## An example of the environment vars is defined in env.example

i.e.
```
JWKS_URI = https://AUTH0_DOMAIN/.well-known/jwks.json
AUDIENCE = http://localhost:3000
ISSUER = https://AUTH0_DOMAIN/
CUSTOM_POLICY_PREFIX = http://slickchat.dev-town.com
```

## Deploy this service before deploying the slick chat api.
```
sls deploy
```


