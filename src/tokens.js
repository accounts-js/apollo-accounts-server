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
    config.server.secret, config.server.tokens.refreshToken.sign
  );
  return { accessToken, refreshToken };
};

export { generateTokens };

/**
 * Verifies an access token.
 *
 * @param {string} userId The user id to encode in the token.
 * @param {string} config The apollo-accounts config.
 */
const verifyAccessTokenMiddleware = (userId, config) => (req, res, next) => {
  req.app.post(config.server.tokenRefreshPath, (req, res) => {  // eslint-disable-line no-shadow
    const refreshToken = req.headers['apollo-accounts:refresh-token'];
    if (refreshToken) {
      try {
        jwt.verify(refreshToken, config.tokens.refreshToken.verify);
      } catch (e) {

      }
    }
  });
};

export { verifyAccessTokenMiddleware };
