const adminmiddlewere=async(req,res,next)=>{
    try {
        console.log(req.user);
        const adminRole=req.user.isAdmin;
        if(!adminRole){
            return res.status(403).json({message:"You are not an admin"});
            }

        // res.status(200).json({ message: req.user.isAdmin})
        next();
        
    } catch (error) {
        console.error(error);
        next(error)
        
    }
}

module.exports=adminmiddlewere;