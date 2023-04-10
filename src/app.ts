import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { logger, stream } from '@utils/logger';
import verifyJWT from './middleware/verifyJWT';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.app.get('/health', (req, res) => {
      res.status(200).send('Success');
    });

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info('=================================');
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS, allowedHeaders: [ 'Authorization', 'Content-Type' ], methods: [ 'GET', 'POST' ],
  }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(verifyJWT);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      if(process.env.NODE_ENV === 'production'){ //TODO change to production
        this.app.use('/api', route.router);
      }
      else{
        this.app.use('/', route.router);
      }
    });
  }

  private initializeSwagger() {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'HuddleUp API',
          version: '1.0.0',
          description: 'Documentation for HuddleUp API',
        },
        servers: [
          {
            url: 'http://localhost:3000',
          },
        ],
      },
      apis: [ './routes/*.ts' ],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }
}

export default App;
