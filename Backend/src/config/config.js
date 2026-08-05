import dotenv from "dotenv"


dotenv.config();

//Check - So that the new version which is not working(example: server not running, api key not provided etc )
// does not gets live

if(!process.env.MONGO_URI)
{
    throw new Error("MONGO_URI is not defined in enviroment variables")
}

if(!process.env.JWT_SECRET)
{
    throw new Error("JWT_SECRET is not defined in enviroment variables")
}


export const config ={
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET
}