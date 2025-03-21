const auth = require('../utility/jwt');
const User = require('../models/user');
const constant = require('../utility/constants')


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


  


  
module.exports = {
    jwtMiddleware,
    adminJwtMiddleware,
    merchantJwtMiddleware,
    addressMiddleware,//all token  pass without role 
}
