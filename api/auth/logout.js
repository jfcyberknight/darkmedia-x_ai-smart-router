const cookie = require('cookie');

module.exports = async (req, res) => {
  res.setHeader('Set-Cookie', cookie.serialize('auth_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }));

  res.redirect('/');
};
