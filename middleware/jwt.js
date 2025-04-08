const auth = require('../utility/jwt');
const User = require('../models/user');
const constant = require('../utility/constants')
const Model = require('../models/index')


//user middleware
async function jwtMiddleware(req, res, next) {
    try {
        const getToken = req.headers.authorization;
        if (!getToken) {
            return res.status(401).send('❌ No token provided.');
        }
        const token = getToken.slice(7);
        console.log('token:',token);
        const decode = auth.verifyToken(token);
         console.log('decodetwo----', decode)
        

        const user = await User.findOne({ _id: decode.id, jti: decode.jti,role:constant.role.USER});
        if (!user||!user.jti||!user.role) {
            console.log('user',user)
            return res.status(404).json({ status:'Unothorized....'})
        }
        console.log('✅ middleware', user)
        req.user = user;
        next();
    
    } catch (err) {
        console.log('error ❌', err)
        res.status(401).json({ status: err });
    }
};



//admin middleware 
async function adminJwtMiddleware(req, res, next) {
    try {
        const getToken = req.headers.authorization;
        if (!getToken) {
            return res.status(401).send('No token provided.');
        }
        const token = getToken.slice(7);
        console.log('token:', token);
        const decode = auth.verifyToken(token);
        //  console.log('decodetwo-----------------------', decode)
        
    
        const user = await User.findOne({ _id: decode.id, jti: decode.jti,role:constant.role.ADMIN});

        if (!user||!user.jti||!user.role) {
            console.log('user',user)
            return res.status(404).json({ status: 'Unothorized....' })
        }
        console.log('✅ middleware', user)
        req.user = user;
        next();
    } catch (err) {
        console.log('error', err)
        res.status(401).json({ status: err });
    }

};



//middleware for merchant
async function merchantJwtMiddleware(req, res, next) {
    try {
        const getToken = req.headers.authorization;
        if (!getToken) {
            return res.status(401).send('No token provided.');
        }
        const token = getToken.slice(7);
        console.log('token:', token);
        const decode = auth.verifyToken(token);
        
        
    
        const user = await User.findOne({ _id: decode.id, jti: decode.jti,role:constant.role.MERCHANT});

        if (!user||!user.jti||!user.role) {
            console.log('user',user)
            return res.status(404).json({ status: 'Unothorized....' })
        }
        console.log('✅ middleware', user)
        req.user = user;
        next();
    } catch (err) {
        console.log('error', err)
        res.status(401).json({ status: err });
    }

};


//address middleware 
async function addressMiddleware(req, res, next) {
    try {
      const getToken = req.headers.authorization;
      if (!getToken) {
        return res.status(401).send(" No token provided.");
      }
  
      const token = getToken.slice(7); 
      const decode = auth.verifyToken(token);
  
      const user = await User.findOne({ _id: decode.id, jti: decode.jti });
  
      if (!user || !user.jti || !user.role) {
        return res.status(403).json({ message: " Unauthorized" });
      }
  
      req.user = user; 
      next();
    } catch (err) {
      console.log(" JWT Middleware Error:", err);
      res.status(401).json({ message: " Invalid Token" });
    }
  }


  //socket.io middleware
  async function verifySocketToken(token1, socket, next) {
    try {
        const token = token1;
        console.log('token:',token1)
        if (!token) {
            return next(new Error('Authentication error: Token is required'));
        }
        const decoded = auth.verifyToken(token)

        if (!decoded) { return res.status(401).json({ message: "invalid token" }) }

        let user = await Model.user.findOne({ _id: decoded.id, isDeleted: false })
        console.log('raman',user)
        if (!user) { return res.status(404).json({ message: "user not found deleted" }) }
        socket.user = user;

        return user._id

    }
    catch (err) {
        (new Error('Authentication error: Invalid token'));
    }

}

  


  
module.exports = {
    jwtMiddleware,
    adminJwtMiddleware,
    merchantJwtMiddleware,
    addressMiddleware,//all token  pass without role 
    verifySocketToken,
}
