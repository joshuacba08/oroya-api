import cors from "cors";
import express, { Application } from "express";

class Server {
  public app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.app.use(cors());
    this.port = port;
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {}

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

export default Server;
