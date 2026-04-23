const { verifyWithExternalProvider, createSessionToken } = require('../../lib/auth-google');
const cookie = require('cookie');
const querystring = require('querystring');

module.exports = async (req, res) => {
  let body = {};

  // Google envoie les données en POST application/x-www-form-urlencoded lors d'une redirection GSI
  if (req.method === 'POST') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      body = querystring.parse(data);
    } else {
      try {
        body = JSON.parse(data);
      } catch (e) {
        body = {};
      }
    }
  }

  // Le token Google est dans 'credential' (GSI redirect) ou 'idToken'
  const idToken = body.credential || body.idToken || req.query.idToken;

  if (!idToken) {
    return res.status(400).send('Token d\'authentification manquant (credential).');
  }

  try {
    // Validation via votre API externe
    const user = await verifyWithExternalProvider(idToken);
    
    // Création de la session locale
    const token = createSessionToken(user);

    res.setHeader('Set-Cookie', cookie.serialize('auth_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
    }));

    // Retour à la racine
    res.redirect('/');
  } catch (err) {
    console.error('Erreur Auth Callback:', err);
    res.status(403).send(`Authentification échouée via Auth-Provider : ${err.message}`);
  }
};
