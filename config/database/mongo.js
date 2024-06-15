import mongoose from "mongoose";

export const establishMongoConnection = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGOOSE_URI)
      .then(({ connection }) => {
        console.log(`MongoDB connected to server: ${connection.host}`);
        resolve(connection);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
