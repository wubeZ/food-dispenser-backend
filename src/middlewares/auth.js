
import jwt from 'jsonwebtoken';
import '../common/env.js'

const auth = (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer){
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = bearer.toString().split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req._id = decoded._id;
    req.email = decoded.email;
    req.isAdmin = decoded.isAdmin;
    req.device_id = decoded.device_id;
    next();

  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export default auth;
