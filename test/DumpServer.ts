import config from "@/config";
import expressLoader from "@/loaders/express-loader";
import routeCollector from "@/loaders/route-collector";
import { Application } from "express";
import { Server } from "http";
import "reflect-metadata";
import axios, { AxiosResponse } from "axios";
import { join } from "path";
import { IConfig } from "@/@types";

interface DumpServerConfigs {
  isTesting?: boolean;
  isProduction?: boolean;
  withoutRoutes?: boolean;
  port?: number;
}

class DumpServer {
  public app: Application;
  public server: Server | null;
  public config: IConfig;

  constructor(options: DumpServerConfigs = {}) {
    // initializing configs
    config.init();
    this.config = Object.assign({}, config);
    this.config.isTesting = options.isTesting ?? true;
    this.config.isProduction = options.isProduction ?? false;

    // creating express app
    this.app = expressLoader();

    // collecting routes
    if (!options.withoutRoutes) routeCollector(this.app);

    this.server = null;
  }

  public get listening() {
    return this.server?.listening ?? false;
  }

  public get instance() {
    return this.server;
  }

  public start(): void {
    if (this.server) throw new Error("Cannot start server, it's already started");
    this.restart();
  }

  public restart(): void {
    if (this.server) this.server.close();
    this.server = this.app.listen(config.port);
    this.config.server = this.server;
  }

  public stop(): void {
    if (!this.server) throw new Error("Cannot stop server, it's not active now");
    this.server.close();
  }

  public post(point: string, data = {}, token = ""): Promise<AxiosResponse<any>> {
    return axios.post(
      `http://localhost:${this.config.port}${join("/api", point)}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  public postForError(
    point: string,
    done: Function,
    tests: Function,
    data = {},
    token = ""
  ) {
    axios
      .post(`http://localhost:${this.config.port}${join("/api", point)}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => done("Error"))
      .catch((err) => {
        tests(err.response);
        done();
      });
  }
}

export default DumpServer;
