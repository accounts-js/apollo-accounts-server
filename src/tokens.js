import jwt from 'jsonwebtoken';

/**
 * Generates JWT tokens for the user
 *
 * @param {string} secret The secret to encode the jwt with.
 * @param {string} userId The user id to encode in the token.
 * @param {string} config The apollo-accounts config.
 * @return {Object} tokens An object containig `accessToken` and `refreshToken`.
 */
const generateTokens = (userId, config) => {
  const accessToken = jwt.sign(
    { userId },
    config.server.secret, config.server.tokens.accessToken.sign
  );
  const refreshToken = jwt.sign(
    { userId },
    config.server.secret, config.server.tokens.refreshToken.sign
  );
  return { accessToken, refreshToken };
};

export { generateTokens };

/**
 * Verifies access token.
 *
 * @param {Object} config The apollo-accounts config.
 */
const verifyAccessTokenMiddleware = (config) => (req, res, next) => {
  // Don't want to verify access tokens if we're trying to refresh tokens.
  if (req.url !== config.server.tokenRefreshPath) {
    const accessToken = req.headers['apollo-accounts:access-token'];
    if (accessToken) {
      try {
        jwt.verify(accessToken, config.tokens.accessToken.verify);
        next();
      } catch (e) {
        // TODO How should this error be handled?
        // res.send(e);
      }
    }
  }
};

export { verifyAccessTokenMiddleware };

/**
 * Creates route for verifying and refreshing tokens.
 *
 * @param {Object} config The apollo-accounts config.
 */
const refreshTokensMiddleware = (config) => (req, res, next) => {
  req.app.post(config.server.tokenRefreshPath, (req) => {  // eslint-disable-line no-shadow
    const refreshToken = req.headers['apollo-accounts:refresh-token'];
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, config.tokens.refreshToken.verify);
        // TODO A new refresh token is generated, this may not be desired behavior.
        // Consider that for refresh token blacklisting this adds more values to manage.
        // Rather than generating a new refresh token, extend the existing one.
        res.json(generateTokens(decoded.payload.userId, config));
        next();
      } catch (e) {
        // TODO How should this error be handled?
      }
    }
  });
};

export { refreshTokensMiddleware };
