const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

if (!MONGO_URI) throw new Error("Missing required env variable: MONGO_URI");
if (!PORT) throw new Error("Missing required env variable: PORT");

export { MONGO_URI, PORT };
