import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { logger, stream } from '@utils/logger';
import { firebaseAdminAuth } from '@/server';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.verifyJWT = this.verifyJWT.bind(this);
    this.verifyFirebaseJWT = this.verifyFirebaseJWT.bind(this);

    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.app.get('/health', (req, res) => {
      res.status(200).send('Success');
    });

    try{
      this.initializeMiddlewares();
    }
    catch(error){
      console.error('Error initializing middlewar for API: ', error);
    }
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
    this.app.use(this.verifyJWT);
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: [ 'swagger.yaml' ],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private async verifyJWT (req : Request, res : Response, next : NextFunction) {
    try{
      const token = req.header('authorization');
  
      if(!token){
        res.status(401).send('Unauthorized');
        return;
      } 
      
      const isValid = await this.verifyFirebaseJWT(token);
      if(!isValid){
        res.status(401).send('Unauthorized');
        return;
      }
    
      next(); //continue to next middleware
    }
    catch (err) {
      console.error(err);
      res.status(500).send('Internal error occurred');
      return;
    }
  }

  private async verifyFirebaseJWT(token: string): Promise<boolean> {
    try {
      const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
      return !!decodedToken;
    } catch (error) {
      return false;
    }
  }
}

export default App;
