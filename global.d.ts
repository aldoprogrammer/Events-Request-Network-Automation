// global.d.ts
declare global {
    var mongoose: {
      conn: mongoose.Mongoose | null;
      promise: Promise<mongoose.Mongoose> | null;
    };
  }
  